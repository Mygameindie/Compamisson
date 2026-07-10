/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { fetchPosts } from "@/lib/posts";
import type { ArtistDetails, PaymentMethod, Profile } from "@/lib/types";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/profile/FollowButton";
import MessageButton from "@/components/profile/MessageButton";
import PaymentsCard from "@/components/profile/PaymentsCard";
import PostCard from "@/components/post/PostCard";

const STATUS_STYLES: Record<ArtistDetails["commission_status"], string> = {
  open: "bg-green-100 text-green-700",
  waitlist: "bg-amber-100 text-amber-700",
  closed: "bg-zinc-200 text-zinc-600",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single<Profile>();
  if (!profile) notFound();

  const t = await getTranslations("profile");
  const isOwn = profile.id === user.id;

  const [
    { data: artistDetails },
    { data: paymentMethods },
    { count: followerCount },
    { count: followingCount },
    { data: myFollow },
    posts,
  ] = await Promise.all([
    supabase
      .from("artist_details")
      .select("*")
      .eq("profile_id", profile.id)
      .maybeSingle<ArtistDetails>(),
    supabase
      .from("payment_methods")
      .select("*")
      .eq("artist_id", profile.id)
      .eq("is_active", true)
      .order("created_at"),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("followee_id", profile.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    supabase
      .from("follows")
      .select("followee_id")
      .match({ follower_id: user.id, followee_id: profile.id })
      .maybeSingle(),
    fetchPosts(supabase, { viewerId: user.id, authorId: profile.id }),
  ]);

  return (
    <div>
      {profile.banner_url ? (
        <img
          src={profile.banner_url}
          alt=""
          className="h-40 w-full rounded-2xl object-cover sm:h-56"
        />
      ) : (
        <div className="h-40 w-full rounded-2xl bg-gradient-to-r from-violet-200 to-fuchsia-200 sm:h-56" />
      )}

      <div className="-mt-10 px-4 sm:px-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="rounded-full ring-4 ring-zinc-50">
            <Avatar profile={profile} size="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-zinc-500">@{profile.username}</p>
          </div>
          <div className="flex gap-2 pb-1">
            {isOwn ? (
              <Link
                href="/settings"
                className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold hover:bg-zinc-100"
              >
                {t("editProfile")}
              </Link>
            ) : (
              <>
                <FollowButton
                  targetId={profile.id}
                  viewerId={user.id}
                  initialFollowing={Boolean(myFollow)}
                />
                <MessageButton targetId={profile.id} />
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <span>
            <strong>{followerCount ?? 0}</strong> {t("followers")}
          </span>
          <span>
            <strong>{followingCount ?? 0}</strong> {t("following")}
          </span>
          {profile.is_artist && artistDetails && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[artistDetails.commission_status]}`}
            >
              {t(`status_${artistDetails.commission_status}`)}
            </span>
          )}
        </div>

        {profile.bio && <p className="mt-3 max-w-2xl whitespace-pre-wrap">{profile.bio}</p>}

        {artistDetails && artistDetails.style_tags.length > 0 && (
          <p className="mt-2 text-sm text-violet-600">
            {artistDetails.style_tags.map((tag) => `#${tag}`).join(" ")}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <h2 className="font-bold">{t("posts")}</h2>
          {posts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
              {t("noPosts")}
            </p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} viewerId={user.id} />)
          )}
        </section>

        <div className="space-y-6">
          {profile.is_artist && (
            <PaymentsCard methods={(paymentMethods as PaymentMethod[]) ?? []} />
          )}
          {artistDetails?.terms_of_service && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="font-bold">{t("terms")}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">
                {artistDetails.terms_of_service}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
