"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function FollowButton({
  targetId,
  viewerId,
  initialFollowing,
}: {
  targetId: string;
  viewerId: string;
  initialFollowing: boolean;
}) {
  const t = useTranslations("profile");
  const [following, setFollowing] = useState(initialFollowing);

  async function toggle() {
    const supabase = createClient();
    if (following) {
      setFollowing(false);
      await supabase
        .from("follows")
        .delete()
        .match({ follower_id: viewerId, followee_id: targetId });
    } else {
      setFollowing(true);
      await supabase
        .from("follows")
        .insert({ follower_id: viewerId, followee_id: targetId });
    }
  }

  return (
    <button
      onClick={toggle}
      className={
        following
          ? "rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold hover:bg-zinc-100"
          : "rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
      }
    >
      {following ? t("unfollow") : t("follow")}
    </button>
  );
}
