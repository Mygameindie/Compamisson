import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/feed");

  const t = await getTranslations("landing");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
        Compamisson
      </p>
      <h1 className="mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">
        {t("headline")}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600">{t("subtitle")}</p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="rounded-full bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700"
        >
          {t("cta")}
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-zinc-300 bg-white px-6 py-3 font-semibold hover:bg-zinc-100"
        >
          {t("login")}
        </Link>
      </div>
      <ul className="mt-12 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
        {(["feature1", "feature2", "feature3"] as const).map((key) => (
          <li key={key} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="font-semibold">{t(`${key}Title`)}</p>
            <p className="mt-1 text-sm text-zinc-600">{t(`${key}Body`)}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
