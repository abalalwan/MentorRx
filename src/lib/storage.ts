import { createClient } from "@/lib/supabase/client";

export type StorageBucket = "mentor-images" | "certificates" | "cv-files";

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File,
  options?: { upsert?: boolean }
): Promise<UploadResult> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: options?.upsert ?? true, contentType: file.type });

  if (error) {
    return { success: false, error: error.message };
  }

  const url = getPublicUrl(bucket, path);
  return { success: true, url, path };
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}

export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `avatars/${userId}.${ext}`;
  return uploadFile("mentor-images", path, file, { upsert: true });
}

export async function uploadCertificate(userId: string, file: File): Promise<UploadResult> {
  const ext = file.name.split(".").pop() ?? "pdf";
  const timestamp = Date.now();
  const path = `${userId}/${timestamp}.${ext}`;
  return uploadFile("certificates", path, file);
}

export async function uploadCV(userId: string, file: File): Promise<UploadResult> {
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${userId}/cv.${ext}`;
  return uploadFile("cv-files", path, file, { upsert: true });
}
