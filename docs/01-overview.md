# 01 — Overview

## Vision

A bilingual (Thai/English) social platform where artists and customers meet, talk, and complete art commissions end-to-end. The platform handles **discovery, communication, and commission tracking**; money moves **directly between customer and artist** using the artist's preferred payment methods (PromptPay, PayPal, bank transfer, etc.), so artists keep 100% of their earnings at launch.

## The problem

Freelance artists — especially in the Thai and Southeast Asian community — mostly run commissions through social media DMs:

- **Scattered workflow.** Discovery happens on X/Twitter or Facebook, negotiation in DMs, references over Discord, payment slips over LINE. Nothing is in one place.
- **No status tracking.** "Is my commission started yet?" requires asking the artist and the artist digging through chats.
- **Payment proof chaos.** PromptPay slips get buried in chat history; artists manually match slips to orders.
- **No portable reputation.** A scammed customer or a ghosted artist has no shared review record to warn others.
- **Language barrier.** Thai artists lose international customers (and vice versa) because platforms are single-language.

## Target users

| User | Needs |
|------|-------|
| **Artist** (hobbyist → full-time freelancer) | Portfolio, "commissions open/closed" signal, price sheet, a queue of orders with statuses, getting paid to their own PromptPay/PayPal without fees, reviews that build reputation |
| **Customer** (fans, VTuber community, indie game devs, writers) | Find artists by style/price/availability, see real reviews, chat before committing, know exactly what stage their commission is in, safe record of what was agreed and paid |
| **Both** | One account works both ways — many artists also buy from other artists |

## Competitor landscape

| Platform | What it does well | Gap Compamisson fills |
|----------|-------------------|----------------------|
| **VGen** | Commission listings, queue management, built-in checkout | Takes a platform cut; no real social feed; weak Thai-market payment support (no PromptPay) |
| **Artistree** | Simple commission forms and queue | Not social — no feed, discovery, or chat community |
| **X/Twitter + DMs** | Massive reach, where the community already is | Zero commission tooling: no statuses, no payment records, no reviews |
| **Facebook groups (Thai commission groups)** | Local reach, PromptPay-friendly by convention | Manual everything; scam posts are common; no structured reputation |
| **Fiverr/Upwork** | Escrow and dispute systems | 20% fees; gig-economy feel that the art community avoids; no PromptPay |

## Differentiation

1. **Social-first.** A real feed (posts, likes, follows, tags) so artists grow an audience *on* the platform, not just process orders.
2. **Artist keeps 100%.** Direct payment (PromptPay QR / PayPal.me / bank) with structured slip-upload proof — no platform cut, no payment license needed at launch.
3. **Thai + English as equals.** Full bilingual UI, THB and USD pricing, PromptPay as a first-class payment method alongside PayPal.
4. **Commission timeline.** Every agreement, payment proof, WIP, and delivery is an event on a shared timeline both parties can see — the single source of truth if anything is disputed.
5. **Escrow-ready.** The data model is designed so a real payment gateway (Opn Payments / Stripe) with escrow and a platform fee can be switched on in phase 3 without restructuring.

## Success criteria (first 6 months after MVP launch)

- Artists can complete a full commission (request → delivery → review) without leaving the platform.
- ≥ 100 artist profiles with portfolios; ≥ 500 registered users.
- ≥ 200 commissions completed with payment proof recorded.
- < 5% of commissions flagged/reported.

## Out of scope (for now)

- Native mobile apps (the site will be responsive/PWA-friendly instead)
- Print-on-demand / physical goods shipping
- NFT / crypto payments
- Adult-content marketplace features (age gates etc.) — revisit with a content policy in phase 2
