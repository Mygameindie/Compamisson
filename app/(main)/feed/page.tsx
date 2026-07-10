import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { fetchPosts } from "@/lib/posts";
import PostComposer from "@/components/post/PostComposer";
import PostCard from "@/components/post/PostCard";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const followingTab = tab !== "discover";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const t = await getTranslations("feed");
  const posts = await fetchPosts(supabase, {
    viewerId: user.id,
    followingOnly: followingTab,
  });

  const tabClass = (active: boolean) =>
    active
      ? "rounded-full bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white"
      : "rounded-full px-4 py-1.5 text-sm font-semibold text-zinc-500 hover:bg-zinc-100";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PostComposer />

      <nav className="flex gap-2">
        <Link href="/feed" className={tabClass(followingTab)}>
          {t("following")}
        </Link>
        <Link href="/feed?tab=discover" className={tabClass(!followingTab)}>
          {t("discover")}
        </Link>
      </nav>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
          <p className="font-medium">
            {followingTab ? t("emptyFollowing") : t("emptyDiscover")}
          </p>
          {followingTab && (
            <Link
              href="/feed?tab=discover"
              className="mt-2 inline-block font-semibold text-violet-600"
            >
              {t("goDiscover")}
            </Link>
          )}
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} viewerId={user.id} />)
      )}
    </div>
  );
}
