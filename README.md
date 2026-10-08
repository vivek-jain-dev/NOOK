# Nook & Co.

A responsive home-and-lifestyle storefront built with Next.js, React, Prisma, and SQLite.

## Features

- Responsive storefront, product search, category/brand/price/rating filters, sorting, and product details
- Customer registration and sign-in with securely hashed passwords
- Persistent wishlist and browser-based shopping bag
- Checkout with delivery details and Cash on Delivery
- Optional Razorpay checkout for UPI and card payments; local demo mode is available for presentations and does not charge money
- Admin sign-in and dashboard for viewing orders and registered customers
- SQLite persistence for products, customer accounts, orders, and order items

## Run locally

Use Node.js 20.9 or newer. From the project directory:

```powershell
npm install
Copy-Item .env.local.example .env.local
```

Edit `.env.local` and set a unique `JWT_SECRET` (at least 32 characters), `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD`. For a local demo without Razorpay credentials, set `PAYMENT_DEMO_MODE=true`. Demo UPI/card transactions are simulations and do not charge money.

Then initialize the database and start the app:

```powershell
npm run db:generate
npm run db:migrate
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default SQLite file is `prisma/dev.db`. Seed data can be refreshed by running `npm run seed` again.

## Payments

Cash on Delivery is available without a payment provider. To accept real UPI or card payments, configure valid server-side `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` values, plus the matching `NEXT_PUBLIC_RAZORPAY_KEY_ID`, and set `PAYMENT_DEMO_MODE=false`. Never commit payment keys or `.env.local`.

## Admin

Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured in `.env.local` to sign in at `/admin`. Admin credentials are not committed to the repository.

## Useful commands

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run seed
npm run lint
npm run build
```

## Deploy to Vercel

Import this repository into Vercel with the project root set to the directory containing this `package.json`. The build command explicitly regenerates Prisma Client before Next.js builds, which avoids stale cached Prisma Client output.

Configure these environment variables in Vercel before deploying:

- `DATABASE_URL`: a reachable database connection string
- `JWT_SECRET`: a unique random secret with at least 32 characters
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: credentials for the admin account
- For live UPI/card payments, set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID`

Vercel's serverless filesystem is not persistent, so the local SQLite database file is not suitable for production data. Use a hosted database with a Prisma-supported provider for deployed accounts, products, and orders; applying this repository's SQLite migrations requires adapting the schema and migrations to the selected provider. Cash on Delivery does not require payment gateway credentials.

## Project structure

```text
app/          Storefront pages and API routes
components/   Shared storefront, cart, wishlist, and product UI
lib/          Database access, authentication, cart, and product helpers
prisma/       SQLite schema and migration history
scripts/      Product seed script
```

## Deployment

The SQLite database in this repository is intended for local development and demos. A local SQLite file is not a suitable persistent/shared database for typical serverless production hosting. Choose a persistent database and configure its Prisma provider and deployment environment before deploying for real customers.
