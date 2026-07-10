import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { ArtistDetails, PaymentMethod, Profile } from "@/lib/types";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";
import PaymentMethodsManager from "@/components/settings/PaymentMethodsManager";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: artistDetails }, { data: paymentMethods }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single<Profile>(),
      supabase
        .from("artist_details")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle<ArtistDetails>(),
      supabase
        .from("payment_methods")
        .select("*")
        .eq("artist_id", user.id)
        .order("created_at"),
    ]);

  if (!profile) redirect("/onboarding");

  const t = await getTranslations("settings");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <ProfileSettingsForm profile={profile} artistDetails={artistDetails ?? null} />
      {profile.is_artist && (
        <PaymentMethodsManager
          initialMethods={(paymentMethods as PaymentMethod[]) ?? []}
        />
      )}
    </div>
  );
}
