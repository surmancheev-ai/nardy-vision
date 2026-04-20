# Stripe Setup Guide For Beginners

This guide explains how to connect Stripe to the project in test mode and verify your first payment safely.

Use this guide only after:
- PostgreSQL is working locally
- the site opens at `http://localhost:3000`
- you can log in to the app

## 1. What We Are Going To Do

We will:
- create a Stripe test account or use your existing Stripe account in test mode
- copy the test secret key into `.env`
- install the Stripe CLI on Windows
- forward Stripe webhooks to your local app
- click a pricing button on the site
- complete a fake payment with Stripe test card data
- confirm that the webhook updates your database

## 2. Important Rule

Do everything in **test mode** first.

Do not use live keys and do not use real cards while testing.

Stripe’s testing guide says to use test API keys and test card numbers such as `4242 4242 4242 4242` for interactive testing. Source:
- [Stripe testing](https://docs.stripe.com/testing)

## 3. Create Or Open Your Stripe Account

1. Open [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign in
3. Turn on **Test mode** in the dashboard

When test mode is enabled, all products, prices, payments, and webhooks are fake and safe for development.

## 4. Get Your Test Secret Key

1. In Stripe Dashboard, open **Developers**
2. Open **API keys**
3. Find the **Secret key** in test mode
4. Copy it

It usually starts with:

```text
sk_test_
```

Put it into your local `.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_value_here
```

## 5. Install Stripe CLI On Windows

The easiest source of truth is Stripe’s own CLI docs:
- [Stripe CLI overview](https://docs.stripe.com/stripe-cli)
- [Use the Stripe CLI](https://docs.stripe.com/stripe-cli/use-cli)

If you have `winget`, open PowerShell and try:

```powershell
winget install Stripe.StripeCLI
```

Then check:

```powershell
stripe --version
```

If that does not work, open the Stripe CLI docs above and use the current Windows installer they provide.

## 6. Log In To Stripe CLI

In PowerShell run:

```powershell
stripe login
```

Stripe will:
- open a browser window
- ask you to confirm access
- connect the CLI to your Stripe test account

After that, the terminal should confirm the login.

## 7. Start Your Local App

In one PowerShell window:

```powershell
npm run dev
```

Leave this window running.

## 8. Forward Webhooks To Your Local App

Open a second PowerShell window in the project folder and run:

```powershell
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/billing/webhook
```

Stripe documents `stripe listen --forward-to ...` for forwarding events to a local endpoint. Source:
- [Use the Stripe CLI](https://docs.stripe.com/stripe-cli/use-cli)

The command will print a signing secret that looks like this:

```text
whsec_...
```

Copy that value into your local `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_value_here
```

Important:
- keep the `stripe listen` terminal open while testing
- if you restart `stripe listen`, Stripe can give you a new webhook secret
- if the secret changes, update `.env`

For this project, it is better to listen to the fuller recurring billing set:

```powershell
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed --forward-to localhost:3000/api/billing/webhook
```

## 9. Restart The App

After updating `.env`, stop the local app and start it again:

```powershell
npm run dev
```

This is necessary because Next.js reads environment variables when the app starts.

## 10. Check That Everything Is Ready

At this point you should have:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

And both processes running:
- `npm run dev`
- `stripe listen ...`

## 11. Start A Test Checkout

1. Open `http://localhost:3000`
2. Sign in
3. Go to `/pricing`
4. Click one of these paid options:
   - `Pro`
   - `Premium`
   - `Position pack`
   - `Match analysis credit`
   - `Single premium study dossier`

The site should redirect you to Stripe Checkout.

If you see an error about Stripe configuration, check:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- that you restarted the app

## 12. Complete The Payment In Test Mode

Use Stripe’s test card:

```text
4242 4242 4242 4242
```

Use:
- any future date, for example `12/34`
- any 3-digit CVC
- any name

This is from Stripe’s official testing guide:
- [Stripe test card numbers](https://docs.stripe.com/testing)

## 13. What Should Happen After Payment

After successful payment:
- Stripe redirects you back to the site
- Stripe sends a webhook to `/api/billing/webhook`
- your app writes the purchase or subscription change into PostgreSQL
- the dashboard should update

Expected result by product type:

### Subscription

If you bought `Pro` or `Premium`:
- `Subscription.planTier` should change
- `Subscription.status` should become active or trialing depending on the session data

### One-time position pack

If you bought a position pack:
- a `Purchase` should appear
- a `PurchaseItem` should appear
- credits should be added to `AnalysisCreditLedger`
- the dashboard should show higher one-time credits

### Match analysis credit

If you bought match compute:
- a `Purchase` should appear
- the compute balance should increase

### Premium material

If you bought a study dossier:
- a `Purchase` should appear
- a `ContentAccessGrant` should be created

## 14. How To Check The Result

Open:

```text
http://localhost:3000/dashboard/subscription
http://localhost:3000/dashboard
```

You should see updated purchases or balances.

If you want to inspect the database directly, use:

```powershell
npx prisma studio
```

Then open the browser UI and inspect:
- `Subscription`
- `Purchase`
- `PurchaseItem`
- `AnalysisCreditLedger`
- `ContentAccessGrant`

## 15. If Checkout Opens But Database Does Not Update

Most likely causes:

1. `stripe listen` is not running
2. `STRIPE_WEBHOOK_SECRET` in `.env` does not match the current CLI session
3. the app was not restarted after changing `.env`
4. webhook forwarding is pointing to the wrong URL

Check the Stripe CLI window first. It usually shows whether the event was forwarded successfully.

## 16. If The Pricing Button Returns An Error Immediately

Most likely causes:

1. `STRIPE_SECRET_KEY` is missing
2. `STRIPE_SECRET_KEY` is from live mode while the rest of the setup is test mode
3. Stripe account is not connected through `stripe login`

## 17. Test The Webhook Without Completing A Full Checkout

Stripe CLI can also trigger events manually, but for this project the most useful first test is the real Checkout flow, because it verifies:
- session creation
- redirect
- payment form
- webhook delivery
- database update

After the first successful payment, manual event testing becomes easier to reason about.

## 18. Recommended First Test Order

Use this exact order:

1. Connect Stripe account in test mode
2. Add `STRIPE_SECRET_KEY`
3. Run `stripe listen ...`
4. Add `STRIPE_WEBHOOK_SECRET`
5. Restart `npm run dev`
6. Log in to the site
7. Buy `Position pack for 10 analyses`
8. Confirm that purchase appears in dashboard
9. Buy `Pro`
10. Confirm that subscription updates

This gives you one one-time test and one subscription test.

## 19. Before Going Live

Do not switch to live mode until:
- local test payments work
- webhook updates work
- server deployment works
- domain and HTTPS work
- you are ready to create live products or live prices in Stripe

Stripe’s subscription Checkout guide also recommends provisioning access from webhook events such as `checkout.session.completed`, and continuing billing lifecycle handling through recurring events like `invoice.paid` and `invoice.payment_failed`. Source:
- [Build a subscriptions integration with Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions?platform=web&ui=stripe-hosted)

For our current MVP, the minimum practical checkpoint is:
- `checkout.session.completed` works for first purchase and first subscription
