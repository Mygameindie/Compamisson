import { redirect } from "next/navigation";

// Shown (via proxy.ts) when the site is deployed without its Supabase
// connection values. Deliberately dependency-free: no Supabase, no i18n.
export default function SetupPage() {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
          Compamisson
        </p>
        <h1 className="mt-2 text-2xl font-bold">
          Almost there! This website isn&apos;t connected to its database yet.
        </h1>
        <p className="mt-3 text-zinc-600">
          The site is deployed, but it needs two settings values from your
          Supabase project before it can store accounts, posts and chats.
        </p>

        <ol className="mt-6 list-decimal space-y-4 pl-5 text-zinc-700">
          <li>
            Create a free project at{" "}
            <a
              href="https://supabase.com"
              className="font-medium text-violet-600 underline"
            >
              supabase.com
            </a>{" "}
            and run the SQL setup file — the full walkthrough is in{" "}
            <a
              href="https://github.com/Mygameindie/Compamisson/blob/claude/commission-marketplace-planning-bs6k5u/SETUP.md"
              className="font-medium text-violet-600 underline"
            >
              SETUP.md
            </a>
            .
          </li>
          <li>
            In Supabase, open <strong>Project Settings → API Keys</strong> and
            copy the <strong>Project URL</strong> and the{" "}
            <strong>anon public key</strong>.
          </li>
          <li>
            In Netlify, open{" "}
            <strong>Site configuration → Environment variables</strong> and add
            both values:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-100 p-3 text-sm">
              {"NEXT_PUBLIC_SUPABASE_URL\nNEXT_PUBLIC_SUPABASE_ANON_KEY"}
            </pre>
          </li>
          <li>
            Redeploy: <strong>Deploys → Trigger deploy → Clear cache and
            deploy site</strong>. (The values are baked in at build time, so a
            new build is required.)
          </li>
        </ol>

        <p className="mt-6 text-sm text-zinc-500">
          Once the new deploy finishes, refresh this page — you&apos;ll see the
          real website.
        </p>
      </div>
    </main>
  );
}
