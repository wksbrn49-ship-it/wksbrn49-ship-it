CREATE TYPE "PaymentNotificationChannel" AS ENUM ('EMAIL', 'SMS');
CREATE TYPE "PaymentNotificationStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'SKIPPED');

CREATE TABLE "PaymentNotification" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "channel" "PaymentNotificationChannel" NOT NULL,
    "status" "PaymentNotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentNotification_stripeSessionId_channel_key"
ON "PaymentNotification"("stripeSessionId", "channel");
CREATE INDEX "PaymentNotification_bookingId_idx"
ON "PaymentNotification"("bookingId");

ALTER TABLE "PaymentNotification"
ADD CONSTRAINT "PaymentNotification_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
