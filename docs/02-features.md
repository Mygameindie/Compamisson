# 02 — Features

Feature specification by area. Tags: **[MVP]** phase 1, **[v1]** phase 2, **[v2]** phase 3. See [07-roadmap.md](07-roadmap.md) for phasing rationale.

## 1. Accounts & profiles

- **[MVP]** Sign up / log in with email+password and Google (Supabase Auth).
- **[MVP]** Every account is both a customer and (optionally) an artist — a profile has an "artist mode" that unlocks artist features. No separate account types.
- **[MVP]** Base profile: display name, username (unique handle), avatar, banner, bio, preferred language (TH/EN), links (X, Instagram, etc.).
- **[MVP]** Artist details (when artist mode is on):
  - Commission status: **Open / Closed / Waitlist**, shown as a badge everywhere the artist appears.
  - Price sheet: a list of offer types (e.g., "Chibi full-body — from ฿800 / $25"), each with name, description, base price, currency, and sample images.
  - Accepted payment methods (see [05-payments.md](05-payments.md)).
  - Terms of service text (revision count, refund policy, usage rights, deadline expectations).
  - Style tags (e.g., `chibi`, `semi-realism`, `vtuber-model`, `emotes`).
- **[v1]** Profile verification badge (manual admin review at first).
- **[v1]** Vacation mode (auto-reply in chat + status override).

## 2. Social feed

- **[MVP]** Posts: text + up to 10 images, style/hashtags. Posts can be marked **portfolio** (pinned to profile gallery) or regular updates.
- **[MVP]** Likes and comments (single-level replies).
- **[MVP]** Follow artists/users; **home feed** = people you follow, **discover feed** = recent + popular posts.
- **[MVP]** Image handling: client-side resize before upload, storage quotas per user, alt text field.
- **[v1]** Search & filters: find artists by style tag, price range, commission status (open only), language, rating.
- **[v1]** Repost/share and "commission this artist" button directly on posts.
- **[v1]** Content flags: mark a post as sensitive (blurred until clicked); report post.
- **[v2]** Trending tags, curated collections, weekly featured artists.

## 3. Chat (direct messages)

- **[MVP]** 1-on-1 realtime conversations (Supabase Realtime), text + image attachments.
- **[MVP]** A commission request can be created from inside a chat, and each commission links back to its conversation — negotiation and order stay connected.
- **[MVP]** Unread indicators; basic notification on new message (in-app).
- **[v1]** Message requests (strangers land in a "requests" inbox until accepted); block user.
- **[v1]** Email notification digest for unread messages.
- **[v2]** Group conversations (e.g., customer + two collaborating artists).

## 4. Commission workflow

The heart of the product. Every commission is a shared object between one customer and one artist with a **status** and an **event timeline**.

- **[MVP]** Statuses: `requested → quoted → accepted → awaiting_payment → paid → in_progress → wip_review → delivered → completed`, plus `cancelled` and `declined` from any pre-delivery state.
- **[MVP]** Request form: offer type (from price sheet, or custom), description, reference image uploads, deadline wish.
- **[MVP]** Artist quote: final price + currency (THB or USD), estimated delivery date, included revision count, notes. Customer accepts or declines; either side can counter by re-quoting.
- **[MVP]** Payment step: platform shows the artist's payment methods; customer uploads payment slip; artist confirms receipt (see [05-payments.md](05-payments.md)). Supports deposit + final split (e.g., 50/50) as two payment records.
- **[MVP]** WIP review: artist posts progress images to the timeline; customer approves or requests a revision (counted against the included revisions).
- **[MVP]** Delivery: artist uploads final files (full resolution, held in private storage); customer marks complete.
- **[MVP]** Timeline: every status change, message-worthy event, payment record, WIP, and delivery is an immutable event with timestamp and actor — the audit trail for disputes.
- **[v1]** Optional watermarking on WIP images until final payment is confirmed.
- **[v1]** Artist queue page: drag-order of active commissions, public "queue" view customers can check.
- **[v1]** Deadline reminders and auto-nudges ("commission has been in `awaiting_payment` for 7 days").
- **[v2]** Commission templates/forms per offer type (custom questions the customer must answer).

## 5. Reviews & reputation

- **[v1]** Mutual reviews after `completed`: 1–5 stars + text, customer reviews artist and vice versa. Both are hidden until both submit (or 14 days pass) to prevent retaliation.
- **[v1]** Artist rating summary on profile (average, count, on-time percentage).
- **[v2]** Dispute-aware badges (e.g., "50 commissions completed, 0 disputes").

## 6. Trust, safety & admin

- **[MVP]** Report user / report commission with reason; reports land in an admin table.
- **[MVP]** Minimal admin dashboard: view reports, suspend accounts, hide posts.
- **[v1]** Commission dispute flag: either party can flag a commission; the timeline + payment records give admins the evidence to mediate (see [05-payments.md](05-payments.md) — platform mediates but cannot force refunds in the direct-payment model; sanctions are account-level).
- **[v1]** Rate limiting and new-account restrictions (e.g., can't mass-DM on day one).
- **[v2]** Automated image moderation pass on upload.

## 7. Internationalization & currency

- **[MVP]** Full UI in Thai and English; language toggle, default from browser/profile setting.
- **[MVP]** Prices entered in THB or USD per offer/commission; always displayed with explicit currency (no automatic conversion — the paid amount must be unambiguous).
- **[v1]** Approximate conversion hint ("≈ $23") for display only, marked as approximate.
- **[v2]** More currencies as demanded (JPY, EUR, SGD).

## 8. Notifications

- **[MVP]** In-app notification center: new follower, comment, like, commission status change, new message.
- **[v1]** Email notifications (transactional: commission events, unread chat digest) with per-type opt-out.
- **[v2]** Web push.
