# Compamisson

**Compamisson** is a social platform for art commissions. Artists showcase their work in a social feed, chat directly with customers, and manage commissions from first request to final delivery — getting paid through the payment methods *they* already use: PromptPay, PayPal, bank transfer, and more.

Think of it as a social network + commission manager in one: discover artists, follow their work, message them, agree on a price, track progress, and leave a review — all in one place, in Thai or English.

## Why?

Today most artists take commissions over Twitter/X DMs, Discord, or Facebook — scattered conversations, no status tracking, payment slips lost in chat history, and no reviews to build trust. Compamisson gives that whole workflow a home without taking a cut of the artist's money (in phase 1, payments go directly from customer to artist).

## Planning documents

| Doc | Contents |
|-----|----------|
| [01 — Overview](docs/01-overview.md) | Vision, target users, competitor landscape, differentiation |
| [02 — Features](docs/02-features.md) | Full feature specification by area |
| [03 — User Flows](docs/03-user-flows.md) | Step-by-step journeys for the key scenarios |
| [04 — Data Model](docs/04-data-model.md) | Database schema (Supabase/Postgres) with relations and RLS notes |
| [05 — Payments](docs/05-payments.md) | Direct-payment flow, proof of payment, disputes, future escrow path |
| [06 — Tech Stack](docs/06-tech-stack.md) | Architecture: Next.js, Supabase, Netlify, i18n, image handling |
| [07 — Roadmap](docs/07-roadmap.md) | Phased build plan: MVP → v1 → v2 |

## Tech at a glance

- **Frontend + backend:** Next.js (App Router) on Netlify
- **Auth, database, storage, realtime chat:** Supabase
- **Languages:** Thai + English (next-intl)
- **Payments (phase 1):** direct transfer — PromptPay QR, PayPal.me, bank transfer — with slip upload as proof
- **Payments (phase 3):** optional gateway (Opn Payments / Stripe) with escrow and platform fee

## Status

🚧 **First version built.** Accounts, profiles with payment methods (PromptPay QR / PayPal / bank), the social feed (posts, likes, comments, follows), and realtime chat are working. The commission order workflow (request → quote → pay → deliver) is next — see the [roadmap](docs/07-roadmap.md).

**👉 To get your copy running, follow [SETUP.md](SETUP.md)** — about 20 minutes with free Supabase and Netlify accounts.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + anon key (see SETUP.md)
npm run dev                  # http://localhost:3000
```
