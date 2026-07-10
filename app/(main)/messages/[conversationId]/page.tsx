import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Message, Profile } from "@/lib/types";
import Avatar from "@/components/Avatar";
import MessageThread from "@/components/chat/MessageThread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS means these queries only return rows if the viewer is a member.
  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .match({ conversation_id: conversationId, profile_id: user.id })
    .maybeSingle();
  if (!membership) notFound();

  const [{ data: otherMember }, { data: messages }] = await Promise.all([
    supabase
      .from("conversation_members")
      .select("profile:profiles(*)")
      .eq("conversation_id", conversationId)
      .neq("profile_id", user.id)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at")
      .limit(200),
  ]);

  const other = (otherMember as unknown as { profile: Profile } | null)?.profile;
  if (!other) notFound();

  return (
    <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-2xl flex-col">
      <Link
        href={`/${other.username}`}
        className="flex items-center gap-3 rounded-t-2xl border border-zinc-200 bg-white px-4 py-3"
      >
        <Avatar profile={other} size="md" />
        <div>
          <p className="font-semibold">{other.display_name || other.username}</p>
          <p className="text-sm text-zinc-500">@{other.username}</p>
        </div>
      </Link>
      <MessageThread
        conversationId={conversationId}
        viewerId={user.id}
        initialMessages={(messages as Message[]) ?? []}
      />
    </div>
  );
}
