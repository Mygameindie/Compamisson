"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import type { PaymentMethod, PaymentMethodDetails, PaymentMethodType } from "@/lib/types";

const TYPE_LABELS: Record<PaymentMethodType, string> = {
  promptpay: "PromptPay",
  paypal: "PayPal",
  bank_transfer: "Bank transfer",
  other: "Other",
};

export default function PaymentMethodsManager({
  initialMethods,
}: {
  initialMethods: PaymentMethod[];
}) {
  const t = useTranslations("settings");
  const [methods, setMethods] = useState(initialMethods);
  const [showForm, setShowForm] = useState(false);

  // new-method form state
  const [type, setType] = useState<PaymentMethodType>("promptpay");
  const [label, setLabel] = useState("");
  const [promptpayId, setPromptpayId] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [paypalUrl, setPaypalUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setLabel("");
    setPromptpayId("");
    setQrFile(null);
    setPaypalUrl("");
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setInstructions("");
    setError(null);
  }

  async function addMethod(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("not signed in");

      const details: PaymentMethodDetails = {};
      if (type === "promptpay") {
        if (!promptpayId && !qrFile) throw new Error(t("promptpayNeedsSomething"));
        if (promptpayId) details.promptpay_id = promptpayId;
        // QR codes are uploaded as-is: downscaling could make them unscannable
        if (qrFile) details.qr_image_url = await uploadImage(qrFile, "qr", { original: true });
      } else if (type === "paypal") {
        if (!/^https:\/\//.test(paypalUrl)) throw new Error(t("paypalNeedsUrl"));
        details.paypal_url = paypalUrl;
      } else if (type === "bank_transfer") {
        if (!accountNumber) throw new Error(t("bankNeedsAccount"));
        details.bank_name = bankName;
        details.account_number = accountNumber;
        details.account_name = accountName;
      } else {
        if (!instructions.trim()) throw new Error(t("otherNeedsInstructions"));
        details.instructions = instructions;
      }

      const { data, error: insertError } = await supabase
        .from("payment_methods")
        .insert({ artist_id: user.id, type, label, details })
        .select()
        .single();
      if (insertError) throw insertError;

      setMethods((prev) => [...prev, data as PaymentMethod]);
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(method: PaymentMethod) {
    const supabase = createClient();
    const next = !method.is_active;
    setMethods((prev) =>
      prev.map((m) => (m.id === method.id ? { ...m, is_active: next } : m))
    );
    await supabase.from("payment_methods").update({ is_active: next }).eq("id", method.id);
  }

  async function remove(method: PaymentMethod) {
    if (!confirm(t("deleteMethodConfirm"))) return;
    const supabase = createClient();
    setMethods((prev) => prev.filter((m) => m.id !== method.id));
    await supabase.from("payment_methods").delete().eq("id", method.id);
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="font-bold">{t("paymentsSection")}</h2>
      <p className="mt-1 text-sm text-zinc-500">{t("paymentsHint")}</p>

      <ul className="mt-4 space-y-3">
        {methods.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3"
          >
            {m.type === "promptpay" && m.details.qr_image_url && (
              <img
                src={m.details.qr_image_url}
                alt="QR"
                className="h-12 w-12 rounded border border-zinc-200 object-contain"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {TYPE_LABELS[m.type]}
                {m.label && <span className="text-zinc-500"> · {m.label}</span>}
              </p>
              <p className="truncate text-sm text-zinc-500">
                {m.details.promptpay_id ||
                  m.details.paypal_url ||
                  m.details.account_number ||
                  m.details.instructions ||
                  (m.details.qr_image_url ? t("qrUploaded") : "")}
              </p>
            </div>
            <label className="flex items-center gap-1 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={m.is_active}
                onChange={() => toggleActive(m)}
              />
              {t("visible")}
            </label>
            <button
              onClick={() => remove(m)}
              className="text-sm text-zinc-400 hover:text-red-600"
            >
              {t("deleteMethod")}
            </button>
          </li>
        ))}
        {methods.length === 0 && (
          <li className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
            {t("noMethods")}
          </li>
        )}
      </ul>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 rounded-full border border-violet-600 px-5 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50"
        >
          {t("addMethod")}
        </button>
      ) : (
        <form onSubmit={addMethod} className="mt-4 space-y-4 rounded-xl bg-violet-50 p-4">
          <label className="block text-sm font-medium">
            {t("methodType")}
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PaymentMethodType)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
            >
              {Object.entries(TYPE_LABELS).map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            {t("methodLabel")}
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("methodLabelPlaceholder")}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>

          {type === "promptpay" && (
            <>
              <label className="block text-sm font-medium">
                {t("promptpayId")}
                <input
                  value={promptpayId}
                  onChange={(e) => setPromptpayId(e.target.value)}
                  placeholder="08x-xxx-xxxx"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                {t("qrImage")}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full text-sm"
                />
              </label>
              <p className="text-xs text-zinc-500">{t("qrHint")}</p>
            </>
          )}

          {type === "paypal" && (
            <label className="block text-sm font-medium">
              {t("paypalUrl")}
              <input
                value={paypalUrl}
                onChange={(e) => setPaypalUrl(e.target.value)}
                placeholder="https://paypal.me/yourname"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
          )}

          {type === "bank_transfer" && (
            <>
              <label className="block text-sm font-medium">
                {t("bank")}
                <input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                {t("accountNumber")}
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                {t("accountName")}
                <input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </label>
            </>
          )}

          {type === "other" && (
            <label className="block text-sm font-medium">
              {t("instructions")}
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {busy ? t("saving") : t("addMethodSubmit")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold hover:bg-zinc-100"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
