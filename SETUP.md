# Setting up Compamisson — step by step

This guide takes you from zero to a live website. You need two free accounts:

1. **Supabase** (stores your users, posts, chats, and images) — https://supabase.com
2. **Netlify** (hosts the website) — https://netlify.com

No credit card needed for either. Total time: about 20 minutes.

---

## Part 1 — Create the Supabase project

1. Go to https://supabase.com and click **Start your project**. Sign in with GitHub or email.
2. Click **New project**.
   - **Name:** `compamisson` (anything works)
   - **Database password:** click "Generate a password" and **save it somewhere safe**
   - **Region:** `Southeast Asia (Singapore)` — closest to Thailand
3. Wait a minute or two while the project is created.

### Run the database setup

4. In the left sidebar, click **SQL Editor**.
5. Open the file [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) from this repository, copy **the whole file**, and paste it into the SQL Editor.
6. Click **Run** (or press Ctrl+Enter). You should see "Success. No rows returned".

That single script creates every table, all the security rules, the chat system, and the image storage bucket.

### Turn off email confirmation (recommended to start)

7. Go to **Authentication → Sign In / Providers → Email**.
8. Turn **off** "Confirm email" and save. (You can turn it back on later — with it off, people can sign up and use the site immediately, which makes your first tests much easier.)

### Copy your keys

9. Go to **Project Settings (gear icon) → API Keys**.
10. Copy these two values — you'll paste them into Netlify in Part 2:
    - **Project URL** — looks like `https://abcdefgh.supabase.co`
    - **anon / public key** — a long string starting with `eyJ...` (use the `anon` `public` key; NEVER share the `service_role` key)

---

## Part 2 — Deploy to Netlify

1. Push this repository to your GitHub account (it's already there if you're reading this on GitHub).
2. Go to https://app.netlify.com and sign in with GitHub.
3. Click **Add new site → Import an existing project → GitHub**, and pick this repository.
4. Netlify detects Next.js automatically. Before deploying, click **Add environment variables** and add these two (from Part 1, step 10):

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |

5. Click **Deploy**. The first build takes 2–3 minutes.
6. When it finishes you get a link like `https://something.netlify.app` — that's your live website! You can rename it under **Site configuration → Change site name**, or connect your own domain later.

### Tell Supabase about your website address

7. Back in Supabase: **Authentication → URL Configuration**.
8. Set **Site URL** to your Netlify address (e.g. `https://compamisson.netlify.app`). This makes email links point to the right place.

---

## Part 3 — Try it out

1. Open your site and **Sign up** with an email and password.
2. Pick a username and tick **I'm an artist**.
3. Go to **Settings**:
   - upload a profile picture
   - set commission status to **Open**
   - under **Payment methods**, add PromptPay and upload your QR code image (save it from your banking app first)
4. Make your first post with an image on the **Feed**.
5. Open your profile — your QR code shows in the **Payment methods** card for signed-in visitors.
6. To test chat: sign up a second account in a private/incognito window, visit your first account's profile, and press **Message**.

---

## Running on your own computer (optional, for development)

```bash
npm install
cp .env.example .env.local     # then fill in the two values from Part 1
npm run dev                    # open http://localhost:3000
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Invalid API key" or endless loading | The two environment variables in Netlify are missing or have typos. Fix them, then trigger a new deploy (Deploys → Trigger deploy). |
| Sign-up says "Email not confirmed" | Part 1 step 7 — turn off Confirm email, or check the inbox for the confirmation link. |
| Images don't upload | Make sure the SQL script ran completely (it creates the `public-media` storage bucket at the end). Check Storage in the Supabase dashboard — you should see a `public-media` bucket. |
| Chat doesn't update live | In Supabase go to **Database → Replication** and confirm `messages` is in the `supabase_realtime` publication (the SQL script adds it, but it's worth checking). |
| Changed something and want to redeploy | Every push to the GitHub branch Netlify watches redeploys automatically. |
