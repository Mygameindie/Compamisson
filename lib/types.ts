export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string;
  is_artist: boolean;
  created_at: string;
};

export type ArtistDetails = {
  profile_id: string;
  commission_status: "open" | "closed" | "waitlist";
  style_tags: string[];
  terms_of_service: string;
};

export type PaymentMethodType = "promptpay" | "paypal" | "bank_transfer" | "other";

export type PaymentMethodDetails = {
  promptpay_id?: string;
  qr_image_url?: string;
  paypal_url?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  instructions?: string;
};

export type PaymentMethod = {
  id: string;
  artist_id: string;
  type: PaymentMethodType;
  label: string;
  details: PaymentMethodDetails;
  is_active: boolean;
  created_at: string;
};

export type PostImage = {
  id: string;
  post_id: string;
  url: string;
  sort_order: number;
};

export type Post = {
  id: string;
  author_id: string;
  body: string;
  tags: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  author: Profile;
  images: PostImage[];
  liked_by_me?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author: Profile;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
};

export type ConversationSummary = {
  id: string;
  last_message_at: string;
  other: Profile;
  last_message: Message | null;
  unread: boolean;
};
