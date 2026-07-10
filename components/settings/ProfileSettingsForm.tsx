"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import type { ArtistDetails, Profile } from "@/lib/types";

export default function ProfileSettingsForm({
  profile,
  artistDetails,
}: {
  profile: Profile;
  artistDetails: ArtistDetails | null;
}) {
  const t = useTranslations("settings");
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [isArtist, setIsArtist] = useState(profile.is_artist);
  const [status, setStatus] = useState<ArtistDetails["commission_status"]>(
    artistDetails?.commission_status ?? "closed"
  );
  const [styleTags, setStyleTags] = useState(
    (artistDetails?.style_tags ?? []).join(", ")
  );
  const [terms, setTerms] = useState(artistDetails?.terms_of_service ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const supabase = createClient();

      const updates: Partial<Profile> = {
        display_name: displayName || profile.username,
        bio,
        is_artist: isArtist,
      };
      if (avatarFile) updates.avatar_url = await uploadImage(avatarFile, "avatar");
      if (bannerFile) updates.banner_url = await uploadImage(bannerFile, "banner");

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);
      if (profileError) throw profileError;

      if (isArtist) {
        const { error: artistError } = await supabase.from("artist_details").upsert(
          {
            profile_id: profile.id,
            commission_status: status,
            style_tags: styleTags
              .split(",")
              .map((s) => s.trim().replace(/^#/, ""))
              .filter(Boolean),
            terms_of_service: terms,
          },
          { onConflict: "profile_id" }
        );
        if (artistError) throw artistError;
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="font-bold">{t("profileSection")}</h2>

      <label className="mt-4 block text-sm font-medium">
        {t("displayName")}
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="mt-4 block text-sm font-medium">
        {t("bio")}
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          {t("avatar")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          {t("banner")}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-lg border border-zinc-200 p-3">
        <input
          type="checkbox"
          checked={isArtist}
          onChange={(e) => setIsArtist(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="block font-medium">{t("artistMode")}</span>
          <span className="block text-sm text-zinc-600">{t("artistModeHint")}</span>
        </span>
      </label>

      {isArtist && (
        <div className="mt-4 space-y-4 rounded-lg bg-violet-50 p-4">
          <label className="block text-sm font-medium">
            {t("commissionStatus")}
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as ArtistDetails["commission_status"])
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
            >
              <option value="open">{t("statusOpen")}</option>
              <option value="waitlist">{t("statusWaitlist")}</option>
              <option value="closed">{t("statusClosed")}</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t("styleTags")}
            <input
              value={styleTags}
              onChange={(e) => setStyleTags(e.target.value)}
              placeholder="chibi, semi-realism, emotes"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            {t("terms")}
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={4}
              placeholder={t("termsPlaceholder")}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {saved && <p className="mt-3 text-sm text-green-600">{t("saved")}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-5 rounded-full bg-violet-600 px-6 py-2.5 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
      >
        {busy ? t("saving") : t("save")}
      </button>
    </form>
  );
}
