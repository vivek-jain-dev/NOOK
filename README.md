# Nook & Co.

A responsive home-and-lifestyle storefront built with Next.js, React, Prisma, and Neon PostgreSQL.

## Features

- Responsive storefront, product search, category/brand/price/rating filters, sorting, and product details
- Customer registration and sign-in with securely hashed passwords
- Persistent wishlist and browser-based shopping bag
- Checkout with delivery details and Cash on Delivery
- Optional Razorpay checkout for UPI and card payments; local demo mode is available for presentations and does not charge money
- Admin sign-in and dashboard for viewing orders and registered customers
- PostgreSQL persistence for products, customer accounts, orders, and order items

## Run locally

Use Node.js 20.9 or newer. From the project directory:

```powershell
npm install
Copy-Item .env.local.example .env.local
```

Edit `.env.local` and set a unique `JWT_SECRET` (at least 32 characters), `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD`. For a local demo without Razorpay credentials, set `PAYMENT_DEMO_MODE=true`. Demo UPI/card transactions are simulations and do not charge money.

Create a Neon PostgreSQL database and copy its pooled connection string into `DATABASE_URL` and its direct connection string into `DIRECT_URL` in `.env.local`. Keep both URLs secret. Then initialize the database and start the app:

```powershell
npm run db:generate
npm run db:migrate
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seed data can be refreshed by running `npm run seed` again.

## Payments

Cash on Delivery is available without a payment provider. To accept real UPI or card payments, configure valid server-side `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` values, plus the matching `NEXT_PUBLIC_RAZORPAY_KEY_ID`, and set `PAYMENT_DEMO_MODE=false`. Never commit payment keys or `.env.local`.

## Admin

Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` configured in `.env.local` to sign in at `/admin`. Admin credentials are not committed to the repository.

## Useful commands

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run seed
npm run lint
npm run build
```

## Deploy to Vercel

Import this repository into Vercel with the project root set to the directory containing this `package.json`. The build command explicitly regenerates Prisma Client before Next.js builds, which avoids stale cached Prisma Client output.

Create a Neon PostgreSQL database. In Vercel's project settings, add these environment variables for Production and Preview as appropriate:

- `DATABASE_URL`: Neon pooled connection string
- `DIRECT_URL`: Neon direct connection string, used by Prisma migrations
- `JWT_SECRET`: a unique random secret with at least 32 characters
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: credentials for the admin account
- For live UPI/card payments, set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `NEXT_PUBLIC_RAZORPAY_KEY_ID`

After setting the database connection strings in `.env.local`, run `npm run db:deploy` and `npm run seed` from a trusted local terminal to create the Neon tables and demo catalog. The Neon database starts empty; existing records in a local SQLite database are not copied automatically. Redeploy after configuring Vercel's environment variables. Cash on Delivery does not require payment gateway credentials.

## Project structure

```text
app/          Storefront pages and API routes
components/   Shared storefront, cart, wishlist, and product UI
lib/          Database access, authentication, cart, and product helpers
prisma/       PostgreSQL schema and migration history
scripts/      Product seed script
```
