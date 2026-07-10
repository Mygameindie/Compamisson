-- Compamisson initial schema
-- Run this whole file in the Supabase SQL Editor (or `supabase db push`).

create extension if not exists citext;

-- ============================================================
-- Enums
-- ============================================================
create type commission_status as enum ('open', 'closed', 'waitlist');
create type payment_method_type as enum ('promptpay', 'paypal', 'bank_transfer', 'other');

-- ============================================================
-- Profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username citext unique check (char_length(username) between 3 and 30),
  display_name text,
  avatar_url text,
  banner_url text,
  bio text default '',
  is_artist boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by everyone"
  on public.profiles for select using (true);

create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Create a profile row automatically on signup
create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Artist details
-- ============================================================
create table public.artist_details (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  commission_status commission_status not null default 'closed',
  style_tags text[] not null default '{}',
  terms_of_service text default ''
);

alter table public.artist_details enable row level security;

create policy "artist details are readable by everyone"
  on public.artist_details for select using (true);

create policy "artists insert own details"
  on public.artist_details for insert with check (auth.uid() = profile_id);

create policy "artists update own details"
  on public.artist_details for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ============================================================
-- Payment methods (the artist's "QR payment place")
-- details jsonb per type:
--   promptpay:     { "promptpay_id": "...", "qr_image_url": "..." }
--   paypal:        { "paypal_url": "https://paypal.me/..." }
--   bank_transfer: { "bank_name": "...", "account_number": "...", "account_name": "..." }
--   other:         { "instructions": "..." }
-- ============================================================
create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.profiles (id) on delete cascade,
  type payment_method_type not null,
  label text not null default '',
  details jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.payment_methods enable row level security;

-- Visible to signed-in users when active (shown on the artist's profile).
-- NOTE: tighten to commission-scoped visibility when commissions are added.
create policy "active payment methods readable by signed-in users"
  on public.payment_methods for select to authenticated
  using (is_active or auth.uid() = artist_id);

create policy "artists manage own payment methods"
  on public.payment_methods for all
  using (auth.uid() = artist_id) with check (auth.uid() = artist_id);

-- ============================================================
-- Posts & feed
-- ============================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null default '',
  tags text[] not null default '{}',
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index posts_author_idx on public.posts (author_id, created_at desc);
create index posts_created_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "posts are readable by everyone"
  on public.posts for select using (true);

create policy "users create own posts"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "users delete own posts"
  on public.posts for delete using (auth.uid() = author_id);

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

alter table public.post_images enable row level security;

create policy "post images are readable by everyone"
  on public.post_images for select using (true);

create policy "users attach images to own posts"
  on public.post_images for insert
  with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));

create policy "users delete images of own posts"
  on public.post_images for delete
  using (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));

create table public.likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.likes enable row level security;

create policy "likes are readable by everyone"
  on public.likes for select using (true);

create policy "users like as themselves"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "users remove own likes"
  on public.likes for delete using (auth.uid() = user_id);

create function public.bump_like_count()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
    return new;
  else
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
    return old;
  end if;
end;
$$;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute function public.bump_like_count();

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index comments_post_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

create policy "comments are readable by everyone"
  on public.comments for select using (true);

create policy "users comment as themselves"
  on public.comments for insert with check (auth.uid() = author_id);

create policy "users delete own comments"
  on public.comments for delete using (auth.uid() = author_id);

create function public.bump_comment_count()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  else
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    return old;
  end if;
end;
$$;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.bump_comment_count();

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index follows_followee_idx on public.follows (followee_id);

alter table public.follows enable row level security;

create policy "follows are readable by everyone"
  on public.follows for select using (true);

create policy "users follow as themselves"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "users unfollow as themselves"
  on public.follows for delete using (auth.uid() = follower_id);

-- ============================================================
-- Chat
-- ============================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

create index conversation_members_profile_idx on public.conversation_members (profile_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text,
  image_url text,
  created_at timestamptz not null default now(),
  check (body is not null or image_url is not null)
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- Membership check used by chat policies. SECURITY DEFINER avoids the
-- infinite recursion of conversation_members policies querying themselves.
create function public.is_conversation_member(conv uuid, usr uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv and profile_id = usr
  );
$$;

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy "members read their conversations"
  on public.conversations for select
  using (public.is_conversation_member(id, auth.uid()));

create policy "members read membership of their conversations"
  on public.conversation_members for select
  using (public.is_conversation_member(conversation_id, auth.uid()));

create policy "members update own membership row"
  on public.conversation_members for update
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "members read messages"
  on public.messages for select
  using (public.is_conversation_member(conversation_id, auth.uid()));

create policy "members send messages as themselves"
  on public.messages for insert
  with check (auth.uid() = sender_id and public.is_conversation_member(conversation_id, auth.uid()));

-- Keep the inbox sorted: bump conversations.last_message_at on new message
create function public.bump_conversation_timestamp()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger on_message_sent
  after insert on public.messages
  for each row execute function public.bump_conversation_timestamp();

-- Find the existing 1-on-1 conversation with another user, or create it.
-- SECURITY DEFINER because it must insert a membership row for the OTHER user.
create function public.get_or_create_conversation(other_id uuid)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  conv uuid;
begin
  if me is null then
    raise exception 'not signed in';
  end if;
  if other_id = me then
    raise exception 'cannot start a conversation with yourself';
  end if;
  if not exists (select 1 from public.profiles where id = other_id) then
    raise exception 'user not found';
  end if;

  select cm1.conversation_id into conv
  from public.conversation_members cm1
  join public.conversation_members cm2
    on cm1.conversation_id = cm2.conversation_id
  where cm1.profile_id = me and cm2.profile_id = other_id
  limit 1;

  if conv is null then
    insert into public.conversations default values returning id into conv;
    insert into public.conversation_members (conversation_id, profile_id)
      values (conv, me), (conv, other_id);
  end if;

  return conv;
end;
$$;

revoke execute on function public.get_or_create_conversation(uuid) from public;
grant execute on function public.get_or_create_conversation(uuid) to authenticated;

-- Realtime for chat
alter publication supabase_realtime add table public.messages;

-- ============================================================
-- Storage: one public bucket for avatars, banners, post images and QR codes.
-- Users may only write inside a folder named after their own user id.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true)
on conflict (id) do nothing;

create policy "public media is readable by everyone"
  on storage.objects for select
  using (bucket_id = 'public-media');

create policy "users upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update own files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'public-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
