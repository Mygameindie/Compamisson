/* eslint-disable @next/next/no-img-element */
import type { Profile } from "@/lib/types";

const SIZES = { sm: "h-8 w-8 text-sm", md: "h-10 w-10", lg: "h-24 w-24 text-3xl" };

export default function Avatar({
  profile,
  size = "md",
}: {
  profile: Pick<Profile, "avatar_url" | "display_name" | "username">;
  size?: keyof typeof SIZES;
}) {
  const name = profile.display_name || profile.username || "?";
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={name}
        className={`${SIZES[size]} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${SIZES[size]} flex shrink-0 items-center justify-center rounded-full bg-violet-200 font-semibold text-violet-700`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
