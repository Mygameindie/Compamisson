"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/format";
import type { Comment } from "@/lib/types";
import Avatar from "@/components/Avatar";

export default function CommentSection({
  postId,
  onCountChange,
}: {
  postId: string;
  onCountChange: (delta: number) => void;
}) {
  const t = useTranslations("post");
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("comments")
      .select("*, author:profiles(*)")
      .eq("post_id", postId)
      .order("created_at")
      .then(({ data }) => {
        setComments((data as Comment[]) ?? []);
        setLoading(false);
      });
  }, [postId]);

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, author_id: user.id, body: text })
      .select("*, author:profiles(*)")
      .single();
    if (!error && data) {
      setComments((prev) => [...prev, data as Comment]);
      setBody("");
      onCountChange(1);
    }
    setBusy(false);
  }

  return (
    <div className="mt-4 border-t border-zinc-100 pt-4">
      {loading ? (
        <p className="text-sm text-zinc-400">{t("loadingComments")}</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-2">
              <Link href={`/${c.author.username}`}>
                <Avatar profile={c.author} size="sm" />
              </Link>
              <div className="min-w-0 rounded-xl bg-zinc-100 px-3 py-2 text-sm">
                <Link href={`/${c.author.username}`} className="font-semibold hover:underline">
                  {c.author.display_name || c.author.username}
                </Link>{" "}
                <span className="text-xs text-zinc-400">{timeAgo(c.created_at)}</span>
                <p className="whitespace-pre-wrap">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={addComment} className="mt-3 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("commentPlaceholder")}
          className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !body.trim()}
          className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("commentButton")}
        </button>
      </form>
    </div>
  );
}
