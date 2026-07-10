import type { SupabaseClient } from "@supabase/supabase-js";
import type { Post } from "@/lib/types";

type FetchOptions = {
  viewerId: string;
  authorId?: string;
  followingOnly?: boolean;
  limit?: number;
};

// Shared post query for the feed tabs and profile pages.
export async function fetchPosts(
  supabase: SupabaseClient,
  { viewerId, authorId, followingOnly, limit = 50 }: FetchOptions
): Promise<Post[]> {
  let query = supabase
    .from("posts")
    .select("*, author:profiles(*), images:post_images(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (authorId) {
    query = query.eq("author_id", authorId);
  }

  if (followingOnly) {
    const { data: follows } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", viewerId);
    const followeeIds = (follows ?? []).map((f) => f.followee_id);
    if (followeeIds.length === 0) return [];
    query = query.in("author_id", followeeIds);
  }

  const { data: posts, error } = await query;
  if (error || !posts) return [];

  // Which of these posts has the viewer liked?
  const postIds = posts.map((p) => p.id);
  const likedIds = new Set<string>();
  if (postIds.length > 0) {
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", viewerId)
      .in("post_id", postIds);
    for (const like of likes ?? []) likedIds.add(like.post_id);
  }

  return posts.map((p) => ({
    ...p,
    images: [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    liked_by_me: likedIds.has(p.id),
  })) as Post[];
}
