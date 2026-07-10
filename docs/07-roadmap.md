# 07 — Roadmap

Three phases. Each phase ends with something real users can use. Estimates assume a solo developer working part-time; treat them as relative sizes, not promises.

## Phase 1 — MVP: a commission can happen end-to-end (~8–10 weeks)

**Goal:** one artist and one customer can go from discovery to a completed, paid, recorded commission without leaving the site.

> **Progress:** milestones 1–4 are built, plus the payment-methods part of milestone 6 (artists show their PromptPay QR / PayPal / bank details on their profile). Next up: milestone 5 (the commission workflow) and the structured pay-with-slip flow.

| # | Milestone | Contents | ~Size |
|---|-----------|----------|-------|
| 1 | Foundation | Next.js + TypeScript + Tailwind + next-intl scaffold (TH/EN), Supabase project, auth (email + Google), `profiles` table + trigger, settings page, CI (lint/typecheck/test) | 1.5 wk |
| 2 | Profiles & artist mode | Artist details, price offers, payment methods (with RLS visibility rule), ToS editor, public profile page with portfolio grid | 1.5 wk |
| 3 | Social feed | Posts + images (client-side compression), likes, comments, follows, home/discover feeds | 2 wk |
| 4 | Chat | Conversations, realtime messages, image attachments, unread state, in-app notifications | 1.5 wk |
| 5 | Commissions | Request form, quote/accept, full state machine + immutable timeline, WIP/revision loop, private delivery files | 2 wk |
| 6 | Payments | Pay screen (PromptPay QR image / PayPal.me / bank), slip upload to private bucket, artist confirm/reject, deposit split | 1 wk |
| 7 | Safety minimum + launch | Report flow, minimal admin table, ToS/privacy pages, seed ~10 invited artists, deploy production | 0.5–1 wk |

**Exit criteria:** 3 real commissions completed by invited beta users; no way to move commission money-state except through the server state machine; TH and EN both fully rendered.

## Phase 2 — v1: trust & growth (~6–8 weeks)

**Goal:** strangers can trust each other; artists get discovered.

- Mutual reviews (double-blind publish) + artist rating summary
- Search & filters (style, price range, open-status, language, rating)
- Dispute flag + admin mediation thread + account sanctions
- Message requests, block user, new-account rate limits
- Email notifications (Resend) with per-type opt-out; deadline/status auto-nudges
- Artist queue page (public order queue), vacation mode, verification badge
- Server-generated PromptPay QR (EMVCo payload with embedded amount)
- WIP watermarking option
- SEO pass on public profiles/posts; share-to-feed on completion

**Exit criteria:** a commission between two strangers completes with both reviews published; a seeded dispute is resolved through the admin flow.

## Phase 3 — v2: protected payments (~8+ weeks, gated on traction + legal review)

**Goal:** optional escrow so customers get real buyer protection and the platform earns revenue.

- Gateway integration: Opn Payments (PromptPay, Thai cards) and/or Stripe (international cards) using their marketplace/sub-merchant product — funds held by the licensed gateway, not by us
- Artist payout onboarding (gateway KYC), `payouts`/`balances` tables
- "Pay protected" checkout beside direct payment; platform fee (5–8%) on protected payments only
- Webhook-confirmed `payment_records` (reusing existing `provider`/`provider_ref` columns)
- Enforceable refunds in the dispute flow for protected payments
- Web push, group conversations, commission intake forms per offer, trending/curation
- **Gate:** legal review of Thai Payment Systems Act implications before any build

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Cold start (no artists → no customers) | Seed with invited Thai artist community; social feed gives artists a reason to post before orders arrive; profile is shareable as a link-in-bio replacement |
| Fake payment slips | Artist is always the confirmation authority; timeline evidence; phase-2 slip-verification API; phase-3 escrow removes the problem |
| Scope creep in MVP | Anything not in the Phase-1 table waits; the state machine + timeline is the only genuinely hard part — protect time for it |
| Free-tier limits (Supabase/Netlify) | Fine for beta; first paid tier (~$25/mo Supabase) only when Realtime connections or storage demand it |
| Content policy issues (sensitive art) | Sensitive flag + blur in v1; written content policy before opening registration beyond invites |

## Immediate next steps (next working session)

1. Scaffold milestone 1 (Next.js + Supabase + i18n + CI) on a new branch.
2. Write the first migration: `profiles` + auth trigger + RLS.
3. Register the Supabase project and Netlify site; add `netlify.toml` + the Next.js runtime plugin and wire Deploy Previews.
