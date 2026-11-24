import {
  PaymentNotificationChannel,
  PaymentNotificationStatus,
  Prisma,
} from "@prisma/client";
import type Stripe from "stripe";
import prisma from "@/app/lib/prisma";

type PaymentNotificationWithBooking = Prisma.PaymentNotificationGetPayload<{
  include: { booking: { include: { customer: true } } };
}>;

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function normalizeSmsPhone(phone: string) {
  const compact = phone.trim().replace(/[\s()-]/g, "");

  if (/^\+[1-9]\d{7,14}$/.test(compact)) {
    return compact;
  }

  if (/^254[17]\d{8}$/.test(compact)) {
    return `+${compact}`;
  }

  if (/^0[17]\d{8}$/.test(compact)) {
    return `+254${compact.slice(1)}`;
  }

  throw new Error("Customer phone number is not in a supported international format.");
}

function formatAmount(session: Stripe.Checkout.Session, currency: string) {
  if (session.amount_total === null) {
    throw new Error("Stripe session does not include a paid amount.");
  }

  return `${currency.toUpperCase()} ${(session.amount_total / 100).toFixed(2)}`;
}

function getPaymentMessage(
  notification: PaymentNotificationWithBooking,
  session: Stripe.Checkout.Session
) {
  const currency = session.currency || notification.booking.currency;
  const amount = formatAmount(session, currency);
  return {
    amount,
    currency: currency.toUpperCase(),
    text: `WEMA Safaris: payment confirmed for booking ${notification.booking.bookingCode}. Amount: ${amount}. Keep this reference for your records.`,
  };
}

async function sendEmail(
  notification: PaymentNotificationWithBooking,
  session: Stripe.Checkout.Session
) {
  const apiKey = requiredEnv("RESEND_API_KEY");
  const from = requiredEnv("RESEND_FROM_EMAIL");
  const payment = getPaymentMessage(notification, session);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [notification.booking.customer.email],
      subject: `Payment confirmed - WEMA Safaris booking ${notification.booking.bookingCode}`,
      text: `Hello ${notification.booking.customer.name},\n\nWe have confirmed your payment of ${payment.amount} for booking ${notification.booking.bookingCode}.\n\n${payment.text}\n\nThank you for choosing WEMA Safaris.`,
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Resend returned HTTP ${response.status}.`);
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

async function sendSms(
  notification: PaymentNotificationWithBooking,
  session: Stripe.Checkout.Session
) {
  const username = requiredEnv("AFRICASTALKING_USERNAME");
  const apiKey = requiredEnv("AFRICASTALKING_API_KEY");
  const phone = notification.booking.customer.phone;

  if (!phone) {
    throw new Error("Customer phone number is missing.");
  }

  const form = new URLSearchParams({
    username,
    to: normalizeSmsPhone(phone),
    message: getPaymentMessage(notification, session).text,
  });
  const senderId = process.env.AFRICASTALKING_SENDER_ID;
  if (senderId) {
    form.set("from", senderId);
  }

  const response = await fetch(
    "https://api.africastalking.com/version1/messaging",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body: form.toString(),
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!response.ok) {
    throw new Error(`Africa's Talking returned HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  const messageData = asRecord(asRecord(payload)?.SMSMessageData);
  const recipients = messageData?.Recipients;

  if (
    !Array.isArray(recipients) ||
    recipients.length === 0 ||
    recipients.some((recipient) => {
      const recipientData = asRecord(recipient);
      return !recipientData || Number(recipientData.statusCode) !== 101;
    })
  ) {
    throw new Error("Africa's Talking did not accept the SMS.");
  }
}

async function deliverOne(
  notification: PaymentNotificationWithBooking,
  session: Stripe.Checkout.Session
) {
  if (notification.status !== PaymentNotificationStatus.PENDING) {
    return;
  }

  const claim = await prisma.paymentNotification.updateMany({
    where: {
      id: notification.id,
      status: PaymentNotificationStatus.PENDING,
    },
    data: {
      status: PaymentNotificationStatus.SENDING,
      attempts: { increment: 1 },
      lastError: null,
    },
  });

  if (claim.count === 0) {
    return;
  }

  try {
    if (notification.channel === PaymentNotificationChannel.EMAIL) {
      await sendEmail(notification, session);
    } else {
      await sendSms(notification, session);
    }

    await prisma.paymentNotification.update({
      where: { id: notification.id },
      data: {
        status: PaymentNotificationStatus.SENT,
        sentAt: new Date(),
        lastError: null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message.slice(0, 500) : "Delivery failed.";

    await prisma.paymentNotification.update({
      where: { id: notification.id },
      data: {
        status: PaymentNotificationStatus.PENDING,
        lastError: message,
      },
    });

    throw new Error(`${notification.channel} notification delivery failed: ${message}`);
  }
}

export async function recordStripePaymentSuccess(
  session: Stripe.Checkout.Session
) {
  if (session.payment_status !== "paid") {
    throw new Error("Stripe session is not paid.");
  }

  if (session.amount_total === null) {
    throw new Error("Stripe session does not include a paid amount.");
  }

  const bookingCode = session.metadata?.bookingCode;
  if (!bookingCode) {
    throw new Error("Stripe session is missing its booking reference.");
  }

  const booking = await prisma.booking.findUnique({
    where: { bookingCode },
    include: { customer: true },
  });

  if (!booking) {
    throw new Error("Booking for the paid Stripe session was not found.");
  }

  const smsStatus = booking.customer.phone
    ? PaymentNotificationStatus.PENDING
    : PaymentNotificationStatus.SKIPPED;

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: "PAID",
        amountDue: 0,
        status: "CONFIRMED",
      },
    }),
    prisma.paymentNotification.createMany({
      data: [
        {
          bookingId: booking.id,
          stripeSessionId: session.id,
          channel: PaymentNotificationChannel.EMAIL,
        },
        {
          bookingId: booking.id,
          stripeSessionId: session.id,
          channel: PaymentNotificationChannel.SMS,
          status: smsStatus,
          lastError: booking.customer.phone
            ? null
            : "SMS was skipped because the booking has no phone number.",
        },
      ],
      skipDuplicates: true,
    }),
  ]);
}

export async function deliverStripePaymentNotifications(
  session: Stripe.Checkout.Session
) {
  const staleSendingBefore = new Date(Date.now() - 2 * 60 * 1000);
  await prisma.paymentNotification.updateMany({
    where: {
      stripeSessionId: session.id,
      status: PaymentNotificationStatus.SENDING,
      updatedAt: { lt: staleSendingBefore },
    },
    data: { status: PaymentNotificationStatus.PENDING },
  });

  const notifications = await prisma.paymentNotification.findMany({
    where: { stripeSessionId: session.id },
    include: { booking: { include: { customer: true } } },
  });
  const outcomes = await Promise.allSettled(
    notifications.map((notification) => deliverOne(notification, session))
  );

  const failure = outcomes.find((outcome) => outcome.status === "rejected");
  if (failure?.status === "rejected") {
    throw failure.reason instanceof Error
      ? failure.reason
      : new Error("Payment notification delivery failed.");
  }

  const pendingCount = await prisma.paymentNotification.count({
    where: {
      stripeSessionId: session.id,
      status: {
        in: [
          PaymentNotificationStatus.PENDING,
          PaymentNotificationStatus.SENDING,
        ],
      },
    },
  });
  const skippedCount = await prisma.paymentNotification.count({
    where: {
      stripeSessionId: session.id,
      status: PaymentNotificationStatus.SKIPPED,
    },
  });

  return {
    pending: pendingCount > 0,
    skipped: skippedCount > 0,
  };
}
