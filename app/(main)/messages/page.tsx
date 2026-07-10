import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import type { Message, Profile } from "@/lib/types";
import Avatar from "@/components/Avatar";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const t = await getTranslations("chat");

  const { data: memberships } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at, conversation:conversations(id, last_message_at)")
    .eq("profile_id", user.id);

  const rows = (memberships ?? []) as unknown as {
    conversation_id: string;
    last_read_at: string;
    conversation: { id: string; last_message_at: string };
  }[];

  rows.sort(
    (a, b) =>
      new Date(b.conversation.last_message_at).getTime() -
      new Date(a.conversation.last_message_at).getTime()
  );

  const convIds = rows.map((r) => r.conversation_id);

  let others = new Map<string, Profile>();
  const lastMessages = new Map<string, Message>();

  if (convIds.length > 0) {
    const [{ data: otherMembers }, { data: recentMessages }] = await Promise.all([
      supabase
        .from("conversation_members")
        .select("conversation_id, profile:profiles(*)")
        .in("conversation_id", convIds)
        .neq("profile_id", user.id),
      supabase
        .from("messages")
        .select("*")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    others = new Map(
      ((otherMembers ?? []) as unknown as { conversation_id: string; profile: Profile }[]).map(
        (m) => [m.conversation_id, m.profile]
      )
    );
    for (const msg of (recentMessages ?? []) as Message[]) {
      if (!lastMessages.has(msg.conversation_id)) lastMessages.set(msg.conversation_id, msg);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{t("inboxTitle")}</h1>
      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
          {t("inboxEmpty")}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
          {rows.map((row) => {
            const other = others.get(row.conversation_id);
            if (!other) return null;
            const last = lastMessages.get(row.conversation_id);
            const unread =
              new Date(row.conversation.last_message_at) > new Date(row.last_read_at) &&
              last?.sender_id !== user.id;
            return (
              <li key={row.conversation_id}>
                <Link
                  href={`/messages/${row.conversation_id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50"
                >
                  <Avatar profile={other} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate ${unread ? "font-bold" : "font-medium"}`}>
                      {other.display_name || other.username}
                    </p>
                    <p
                      className={`truncate text-sm ${unread ? "font-semibold text-zinc-800" : "text-zinc-500"}`}
                    >
                      {last
                        ? (last.sender_id === user.id ? `${t("you")}: ` : "") +
                          (last.body ?? `📷 ${t("photo")}`)
                        : t("noMessagesYet")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-zinc-400">
                      {timeAgo(row.conversation.last_message_at)}
                    </span>
                    {unread && <span className="h-2.5 w-2.5 rounded-full bg-violet-600" />}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
