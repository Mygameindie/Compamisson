import { createClient } from "@/lib/supabase/client";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

// Downscale in the browser so uploads stay small on mobile connections.
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1024 * 1024) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("image encode failed"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

/**
 * Upload an image to the public bucket under the signed-in user's folder.
 * Returns the public URL.
 * @param kind subfolder for tidiness: "avatar" | "banner" | "post" | "qr" | "chat"
 * @param original pass true to skip downscaling (QR codes must stay crisp)
 */
export async function uploadImage(
  file: File,
  kind: string,
  { original = false }: { original?: boolean } = {}
): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not signed in");

  const blob = original ? file : await downscale(file);
  const ext = original ? (file.name.split(".").pop() || "png").toLowerCase() : "jpg";
  const path = `${user.id}/${kind}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("public-media")
    .upload(path, blob, { contentType: original ? file.type : "image/jpeg" });
  if (error) throw error;

  const { data } = supabase.storage.from("public-media").getPublicUrl(path);
  return data.publicUrl;
}
