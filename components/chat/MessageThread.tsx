"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import { messageTime } from "@/lib/format";
import type { Message } from "@/lib/types";

export default function MessageThread({
  conversationId,
  viewerId,
  initialMessages,
}: {
  conversationId: string;
  viewerId: string;
  initialMessages: Message[];
}) {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = createClient();

    function markRead() {
      supabase
        .from("conversation_members")
        .update({ last_read_at: new Date().toISOString() })
        .match({ conversation_id: conversationId, profile_id: viewerId })
        .then();
    }
    markRead();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev, message]
          );
          markRead();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, viewerId]);

  async function send(text: string | null, imageUrl: string | null) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: viewerId,
        body: text,
        image_url: imageUrl,
      })
      .select()
      .single();
    if (!error && data) {
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]
      );
    }
  }

  async function sendText(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    setBody("");
    await send(text, null);
    setBusy(false);
  }

  async function sendImage(file: File | null) {
    if (!file || busy) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, "chat");
      await send(null, url);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto border-x border-zinc-200 bg-white px-4 py-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-400">{t("threadEmpty")}</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === viewerId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  mine ? "bg-violet-600 text-white" : "bg-zinc-100"
                }`}
              >
                {m.image_url && (
                  <img
                    src={m.image_url}
                    alt=""
                    className="mb-1 max-h-64 rounded-lg object-contain"
                  />
                )}
                {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                <p
                  className={`mt-0.5 text-right text-[10px] ${
                    mine ? "text-violet-200" : "text-zinc-400"
                  }`}
                >
                  {messageTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendText}
        className="flex items-center gap-2 rounded-b-2xl border border-zinc-200 bg-white px-3 py-3"
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => sendImage(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          title={t("attachImage")}
          className="rounded-full border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:opacity-50"
        >
          🖼
        </button>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className="min-w-0 flex-1 rounded-full border border-zinc-300 px-4 py-2"
        />
        <button
          type="submit"
          disabled={busy || !body.trim()}
          className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {t("send")}
        </button>
      </form>
    </>
  );
}
