"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function MessageButton({ targetId }: { targetId: string }) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function openChat() {
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      other_id: targetId,
    });
    setBusy(false);
    if (!error && data) {
      router.push(`/messages/${data}`);
    }
  }

  return (
    <button
      onClick={openChat}
      disabled={busy}
      className="rounded-full border border-violet-600 px-5 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50 disabled:opacity-50"
    >
      {t("message")}
    </button>
  );
}
