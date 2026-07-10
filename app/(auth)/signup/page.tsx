"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

function confirmationRedirectUrl() {
  const siteUrl = configuredSiteUrl || window.location.origin;
  return `${siteUrl}/auth/callback`;
}

export default function SignupPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [confirmationError, setConfirmationError] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (!code) return;

    setConfirmationError(true);
    setError(
      code === "otp_expired"
        ? t("confirmationExpired")
        : t("confirmationFailed")
    );
  }, [t]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: confirmationRedirectUrl() },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setCheckEmail(true);
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    if (!email) {
      setError(t("enterEmailToResend"));
      return;
    }

    setResending(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: confirmationRedirectUrl() },
    });

    if (error) {
      setError(error.message);
    } else {
      setNotice(t("confirmationResent"));
      setCheckEmail(true);
      setConfirmationError(false);
    }
    setResending(false);
  }

  if (checkEmail) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">{t("checkEmailTitle")}</h1>
          <p className="mt-3 text-zinc-600">{t("checkEmailBody", { email })}</p>
          {notice && <p className="mt-4 text-sm text-emerald-700">{notice}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          <button
            type="button"
            disabled={resending}
            onClick={resendConfirmation}
            className="mt-6 w-full rounded-full border border-violet-300 px-5 py-2.5 font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
          >
            {resending ? t("resendingConfirmation") : t("resendConfirmation")}
          </button>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-semibold text-violet-600"
          >
            {t("loginLink")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-bold">{t("signupTitle")}</h1>
        <label className="mt-6 block text-sm font-medium">
          {t("email")}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          {t("password")}
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <p className="mt-1 text-xs text-zinc-500">{t("passwordHint")}</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {notice && <p className="mt-3 text-sm text-emerald-700">{notice}</p>}
        {confirmationError && (
          <button
            type="button"
            disabled={resending}
            onClick={resendConfirmation}
            className="mt-4 w-full rounded-full border border-violet-300 py-2.5 font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
          >
            {resending ? t("resendingConfirmation") : t("resendConfirmation")}
          </button>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-full bg-violet-600 py-2.5 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {t("signupButton")}
        </button>
        <p className="mt-4 text-center text-sm text-zinc-600">
          {t("haveAccount")} {" "}
          <Link href="/login" className="font-semibold text-violet-600">
            {t("loginLink")}
          </Link>
        </p>
      </form>
    </main>
  );
}
