"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";

const MAX_IMAGES = 4;

export default function PostComposer() {
  const t = useTranslations("feed");
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, MAX_IMAGES);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    if (fileInput.current) fileInput.current.value = "";
  }

  function removeImage(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("not signed in");

      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          body: body.trim(),
          tags: tags
            .split(",")
            .map((s) => s.trim().replace(/^#/, ""))
            .filter(Boolean),
        })
        .select()
        .single();
      if (postError) throw postError;

      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i], "post");
        const { error: imageError } = await supabase
          .from("post_images")
          .insert({ post_id: post.id, url, sort_order: i });
        if (imageError) throw imageError;
      }

      setBody("");
      setTags("");
      setFiles([]);
      setPreviews([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-zinc-200 bg-white p-5">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("composerPlaceholder")}
        rows={3}
        className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2"
      />

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={src} className="relative">
              <img src={src} alt="" className="h-24 w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => pickFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={files.length >= MAX_IMAGES}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50"
        >
          🖼 {t("addImages", { max: MAX_IMAGES })}
        </button>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={t("tagsPlaceholder")}
          className="min-w-0 flex-1 rounded-full border border-zinc-200 px-4 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={busy || (!body.trim() && files.length === 0)}
          className="rounded-full bg-violet-600 px-6 py-1.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {busy ? t("posting") : t("postButton")}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
