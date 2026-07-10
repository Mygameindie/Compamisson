import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";
import type { Profile } from "@/lib/types";

export default async function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile?.username) redirect("/onboarding");

  const t = await getTranslations("nav");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-14 w-full max-w-5xl items-center gap-5 px-4">
          <Link href="/feed" className="text-lg font-bold text-violet-600">
            Compamisson
          </Link>
          <div className="ml-auto flex items-center gap-4 text-sm font-medium">
            <Link href="/feed" className="hover:text-violet-600">
              {t("feed")}
            </Link>
            <Link href="/messages" className="hover:text-violet-600">
              {t("messages")}
            </Link>
            <Link href="/settings" className="hover:text-violet-600">
              {t("settings")}
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-zinc-500 hover:text-violet-600">
                {t("signOut")}
              </button>
            </form>
            <Link href={`/${profile.username}`} title={t("myProfile")}>
              <Avatar profile={profile} size="sm" />
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
