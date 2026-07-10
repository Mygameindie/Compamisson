import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const features = ["feature1", "feature2", "feature3"] as const;

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-zinc-950 px-6 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.28),transparent_34rem),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_30rem)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <nav className="flex items-center justify-between" aria-label="Primary navigation">
          <Link href="/" className="text-lg font-black tracking-tight">Compamisson</Link>
          <Link href="/login" className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10">
            {t("login")}
          </Link>
        </nav>

        <section className="flex flex-1 flex-col items-center justify-center py-20 text-center sm:py-28">
          <p className="rounded-full border border-violet-300/25 bg-violet-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-violet-200">
            Art commissions, organized
          </p>
          <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {t("headline")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">{t("subtitle")}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="rounded-full bg-white px-7 py-3.5 font-bold text-zinc-950 hover:bg-violet-100">
              {t("cta")}
            </Link>
            <Link href="/login" className="rounded-full border border-white/20 px-7 py-3.5 font-bold hover:bg-white/10">
              {t("login")}
            </Link>
          </div>
          <p className="mt-5 text-sm text-zinc-400">Free to join · Direct payments · No platform fee</p>
        </section>

        <ul className="grid gap-4 md:grid-cols-3" aria-label="Platform features">
          {features.map((key, index) => (
            <li key={key} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <span className="text-sm font-black text-violet-300">0{index + 1}</span>
              <h2 className="mt-4 text-lg font-bold">{t(`${key}Title`)}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{t(`${key}Body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
