This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Car hire and on-demand rides

The car-hire form supports the existing daily hire flow and an on-demand ride request with a driver. On-demand estimates use a KSh 200 base fare, KSh 50 per kilometer, and KSh 5 per minute, with a 10% uplift. The estimate is provisional until WEMA confirms the request.

To enable automatic road-distance and duration estimates, configure a server-side `GOOGLE_MAPS_API_KEY` with the Google Routes API enabled and appropriate API restrictions and quotas. Without it, customers can enter the route distance and duration manually. Driver ratings and live driver dispatch are not available until driver data and dispatch workflows are connected.

Apply the database migration with `npx prisma migrate deploy` before accepting on-demand ride requests.

## Payment confirmations

After a Stripe payment is verified, the app sends a confirmation email through Resend and an SMS through Africa's Talking. Delivery attempts are stored so Stripe webhook retries do not resend notifications that have already succeeded. If a booking has no phone number, the SMS is skipped.

Configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (a verified Resend sender), `AFRICASTALKING_USERNAME`, and `AFRICASTALKING_API_KEY`. `AFRICASTALKING_SENDER_ID` is optional. Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` for the `/api/webhooks/stripe` endpoint and enable the `checkout.session.completed` and `checkout.session.async_payment_succeeded` events. Add these values in Vercel's environment settings for production; do not commit secrets.

Apply database migrations with `npx prisma migrate deploy` before enabling notifications. M-Pesa/Daraja payment callbacks are not currently integrated, so these automatic notifications apply to verified Stripe payments.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
