import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type UploadType = "avatar" | "certificate" | "cv";

const BUCKET_MAP: Record<UploadType, string> = {
  avatar: "mentor-images",
  certificate: "certificates",
  cv: "cv-files",
};

const PATH_MAP: Record<UploadType, (userId: string, ext: string) => string> = {
  avatar: (userId, ext) => `avatars/${userId}.${ext}`,
  certificate: (userId, ext) => `${userId}/${Date.now()}.${ext}`,
  cv: (userId, ext) => `${userId}/cv.${ext}`,
};

const MAX_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as UploadType) || "avatar";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `File too large (max ${MAX_SIZE_MB}MB)` }, { status: 400 });
  }

  const allowedTypes = type === "avatar" ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const bucket = BUCKET_MAP[type];
  const ext = file.name.split(".").pop() ?? "bin";
  const path = PATH_MAP[type](user.id, ext);

  // Use service client so the upload always succeeds regardless of RLS on storage
  const service = await createServiceClient();
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await service.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("[Upload] Storage error:", uploadError.message);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

  // If uploading an avatar, update the profile row immediately
  if (type === "avatar") {
    await service.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
  }

  return NextResponse.json({ success: true, url: publicUrl, path });
}
