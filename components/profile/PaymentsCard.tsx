/* eslint-disable @next/next/no-img-element */
import { getTranslations } from "next-intl/server";
import type { PaymentMethod } from "@/lib/types";
import CopyButton from "@/components/CopyButton";

const TYPE_LABELS: Record<PaymentMethod["type"], string> = {
  promptpay: "PromptPay",
  paypal: "PayPal",
  bank_transfer: "Bank transfer",
  other: "Other",
};

// The artist's "payment place": shows their PromptPay QR, PayPal link,
// or bank details so a customer can pay them directly.
export default async function PaymentsCard({ methods }: { methods: PaymentMethod[] }) {
  const t = await getTranslations("payments");
  if (methods.length === 0) return null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="font-bold">{t("title")}</h2>
      <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
      <ul className="mt-4 space-y-4">
        {methods.map((m) => (
          <li key={m.id} className="rounded-xl border border-zinc-100 p-4">
            <p className="text-sm font-semibold text-violet-600">
              {TYPE_LABELS[m.type]}
              {m.label && <span className="text-zinc-500"> · {m.label}</span>}
            </p>

            {m.type === "promptpay" && (
              <div className="mt-2 space-y-2">
                {m.details.qr_image_url && (
                  <img
                    src={m.details.qr_image_url}
                    alt="PromptPay QR code"
                    className="h-48 w-48 rounded-lg border border-zinc-200 object-contain"
                  />
                )}
                {m.details.promptpay_id && (
                  <p className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500">{t("promptpayId")}:</span>
                    <span className="font-mono">{m.details.promptpay_id}</span>
                    <CopyButton value={m.details.promptpay_id} />
                  </p>
                )}
              </div>
            )}

            {m.type === "paypal" && m.details.paypal_url && (
              <a
                href={m.details.paypal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-violet-600 underline"
              >
                {m.details.paypal_url}
              </a>
            )}

            {m.type === "bank_transfer" && (
              <div className="mt-2 space-y-1 text-sm">
                {m.details.bank_name && (
                  <p>
                    <span className="text-zinc-500">{t("bank")}:</span> {m.details.bank_name}
                  </p>
                )}
                {m.details.account_number && (
                  <p className="flex items-center gap-2">
                    <span className="text-zinc-500">{t("accountNumber")}:</span>
                    <span className="font-mono">{m.details.account_number}</span>
                    <CopyButton value={m.details.account_number} />
                  </p>
                )}
                {m.details.account_name && (
                  <p>
                    <span className="text-zinc-500">{t("accountName")}:</span>{" "}
                    {m.details.account_name}
                  </p>
                )}
              </div>
            )}

            {m.type === "other" && m.details.instructions && (
              <p className="mt-2 whitespace-pre-wrap text-sm">{m.details.instructions}</p>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-zinc-400">{t("disclaimer")}</p>
    </section>
  );
}
