# 06 — Tech Stack & Architecture

## Summary

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js (App Router, TypeScript)** | One codebase for UI + API route handlers; SSR for public profiles/posts (SEO for artist discovery); huge ecosystem |
| Hosting | **Vercel** | Zero-ops deploys from GitHub, free tier fits MVP, edge caching for public pages |
| Auth | **Supabase Auth** | Email + Google OAuth out of the box; session handling via `@supabase/ssr` |
| Database | **Supabase Postgres + RLS** | Relational fits commissions/payments; RLS gives defense-in-depth for private data (payment methods, chats, slips) |
| Storage | **Supabase Storage** | Public bucket for media, private buckets for slips and deliverables, policy-scoped access |
| Realtime chat | **Supabase Realtime** | Postgres-changes subscription per conversation; no separate websocket infra |
| i18n | **next-intl** | App Router–native, TH/EN message catalogs, locale routing |
| UI | **Tailwind CSS + shadcn/ui** | Fast to build, accessible primitives, easy theming |
| Forms/validation | **react-hook-form + zod** | Zod schemas shared between client forms and route-handler validation |
| Email | **Resend** (v1) | Transactional notifications; free tier to start |
| Testing | **Vitest** (unit) + **Playwright** (e2e) | Playwright is pre-provisioned in this dev environment |
| CI | **GitHub Actions** | Lint, typecheck, test on PR; Vercel preview deploys per branch |

## Architecture principles

1. **Supabase client for reads, server for writes that matter.** Browser talks to Supabase directly (with RLS) for feeds, profiles, chat — cheap and realtime. Anything involving money or state machines (commission status transitions, payment confirmation, review publishing) goes through **Next.js route handlers using the service-role key**, where the transition rules in [04-data-model.md](04-data-model.md) are enforced. RLS is the safety net, not the business logic.
2. **The commission state machine lives in one module.** A single `transitionCommission(id, action, actor)` server function validates actor role + current status + action, writes the new status and the `commission_events` row in one transaction. No other code path may touch `commissions.status`.
3. **Immutable timeline.** `commission_events` has no update/delete — disputes are decided on this record.
4. **Bilingual from the first commit.** Every user-facing string goes through next-intl from day one; retrofitting i18n is far more expensive than starting with it. Locale routing: `/{locale}/...` with `th` and `en`.
5. **Currency is data, never assumption.** Amounts always stored and rendered with their currency; no implicit conversion.

## Project structure

```
compamisson/
├── app/
│   └── [locale]/
│       ├── (marketing)/            # landing, about, terms
│       ├── (main)/
│       │   ├── feed/               # home + discover
│       │   ├── search/
│       │   ├── [username]/         # public profile, portfolio, price sheet
│       │   ├── messages/[conversationId]/
│       │   ├── commissions/        # list + [id] detail (timeline, pay screen)
│       │   ├── settings/           # profile, artist mode, payment methods, ToS
│       │   └── admin/              # reports, disputes (is_admin gated)
│       └── api/                    # route handlers: commission transitions,
│                                   # payment confirm, review publish, reports
├── components/                     # ui/ (shadcn), feed/, chat/, commission/
├── lib/
│   ├── supabase/                   # browser + server clients
│   ├── commissions/state-machine.ts
│   ├── payments/                   # record helpers, (v1) promptpay-qr payload
│   └── validation/                 # zod schemas
├── messages/                       # en.json, th.json
├── supabase/
│   ├── migrations/                 # SQL migrations (Supabase CLI)
│   └── seed.sql                    # dev seed data
└── e2e/                            # Playwright specs
```

## Images & files

- Client-side downscale/compress before upload (browser canvas or `browser-image-compression`) — protects storage quota and mobile uploaders on Thai mobile networks.
- Next.js `<Image>` + Supabase Storage image transformations for thumbnails.
- Private buckets (`payment-proofs`, `commission-files`) are accessed via short-lived **signed URLs** minted by route handlers after a party-membership check — never public URLs.
- Per-user storage quota tracked in app logic (MVP: generous fixed cap, e.g. 1 GB).

## Realtime & notifications

- Chat: Realtime subscription on `messages` filtered by conversation; RLS applies to the stream.
- Notification center: `notifications` table + Realtime subscription for the badge count.
- v1 email via Resend triggered from the same server paths that write notifications.

## Environments & config

| Env | Supabase project | Deploy |
|-----|------------------|--------|
| Local dev | `supabase start` (local Docker) or a dev project | `next dev` |
| Staging | dedicated project | Vercel preview (main branch) |
| Production | dedicated project | Vercel production |

Secrets in Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `RESEND_API_KEY` (v1). Service-role key must never be imported in client components — enforce with ESLint rule (`no-restricted-imports` on the server client from client files).

## Scale posture

MVP targets hundreds of users on free tiers. Known first bottlenecks and their (deferred) answers: discover-feed ranking (move to a periodic materialized view), Realtime connection limits (Supabase paid tier), image bandwidth (Storage CDN is already fronted by a CDN). None of these need solving before there's traffic.
