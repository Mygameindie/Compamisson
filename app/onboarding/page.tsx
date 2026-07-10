"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isArtist, setIsArtist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/login");
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!USERNAME_RE.test(username)) {
      setError(t("usernameInvalid"));
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        username,
        display_name: displayName || username,
        is_artist: isArtist,
      })
      .eq("id", user.id);

    if (profileError) {
      setError(
        profileError.code === "23505" ? t("usernameTaken") : profileError.message
      );
      setBusy(false);
      return;
    }

    if (isArtist) {
      await supabase
        .from("artist_details")
        .upsert({ profile_id: user.id }, { onConflict: "profile_id" });
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8"
      >
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-600">{t("subtitle")}</p>
        <label className="mt-6 block text-sm font-medium">
          {t("username")}
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            placeholder="my_art_name"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <p className="mt-1 text-xs text-zinc-500">{t("usernameHint")}</p>
        <label className="mt-4 block text-sm font-medium">
          {t("displayName")}
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="mt-5 flex items-start gap-3 rounded-lg border border-zinc-200 p-3">
          <input
            type="checkbox"
            checked={isArtist}
            onChange={(e) => setIsArtist(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">{t("artistToggle")}</span>
            <span className="block text-sm text-zinc-600">{t("artistToggleHint")}</span>
          </span>
        </label>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-full bg-violet-600 py-2.5 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
