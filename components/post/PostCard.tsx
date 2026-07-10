"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/format";
import type { Post } from "@/lib/types";
import Avatar from "@/components/Avatar";
import CommentSection from "@/components/post/CommentSection";

export default function PostCard({
  post,
  viewerId,
}: {
  post: Post;
  viewerId: string;
}) {
  const t = useTranslations("post");
  const router = useRouter();
  const [liked, setLiked] = useState(post.liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [showComments, setShowComments] = useState(false);

  async function toggleLike() {
    const supabase = createClient();
    if (liked) {
      setLiked(false);
      setLikeCount((n) => Math.max(n - 1, 0));
      await supabase.from("likes").delete().match({ post_id: post.id, user_id: viewerId });
    } else {
      setLiked(true);
      setLikeCount((n) => n + 1);
      await supabase.from("likes").insert({ post_id: post.id, user_id: viewerId });
    }
  }

  async function deletePost() {
    if (!confirm(t("deleteConfirm"))) return;
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", post.id);
    router.refresh();
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <Link href={`/${post.author.username}`}>
          <Avatar profile={post.author} size="md" />
        </Link>
        <div className="min-w-0">
          <Link
            href={`/${post.author.username}`}
            className="block truncate font-semibold hover:underline"
          >
            {post.author.display_name || post.author.username}
          </Link>
          <p className="text-sm text-zinc-500">
            @{post.author.username} · {timeAgo(post.created_at)}
          </p>
        </div>
        {post.author_id === viewerId && (
          <button
            onClick={deletePost}
            className="ml-auto text-sm text-zinc-400 hover:text-red-600"
          >
            {t("delete")}
          </button>
        )}
      </div>

      {post.body && <p className="mt-3 whitespace-pre-wrap">{post.body}</p>}

      {post.images.length > 0 && (
        <div
          className={`mt-3 grid gap-2 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {post.images.map((img) => (
            <img
              key={img.id}
              src={img.url}
              alt=""
              className="max-h-96 w-full rounded-xl border border-zinc-100 object-cover"
            />
          ))}
        </div>
      )}

      {post.tags.length > 0 && (
        <p className="mt-2 text-sm text-violet-600">
          {post.tags.map((tag) => `#${tag}`).join(" ")}
        </p>
      )}

      <div className="mt-3 flex gap-6 text-sm text-zinc-500">
        <button
          onClick={toggleLike}
          className={liked ? "font-semibold text-violet-600" : "hover:text-violet-600"}
        >
          ♥ {likeCount}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="hover:text-violet-600"
        >
          💬 {commentCount}
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          onCountChange={(delta) => setCommentCount((n) => Math.max(n + delta, 0))}
        />
      )}
    </article>
  );
}
