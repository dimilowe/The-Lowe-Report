import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { AdminSessionData, sessionOptions } from "@/lib/admin-session";
import { getReplitStorageClient } from "@/lib/objectStorage/replitClient";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Allowed file extensions for uploads
const ALLOWED_EXTENSIONS = [
  'pdf', 'zip', 'jpg', 'jpeg', 'png', 'gif', 'webp',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'mp3', 'mp4', 'mov', 'avi', 'mkv', 'wav',
  'txt', 'md', 'csv', 'json'
];
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB
const LOCAL_WORKSPACE_UPLOAD_DIR = path.join(process.cwd(), "tmp", "workspace-uploads");
const ALLOW_LOCAL_FILE_FALLBACK = process.env.NODE_ENV !== "production";

export async function POST(request: NextRequest) {
  const session = await getIronSession<AdminSessionData>(await cookies(), sessionOptions);

  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 500MB." },
        { status: 400 }
      );
    }

    // Validate file extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ 
        error: `File type .${ext} not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}` 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${randomUUID()}.${ext}`;
    
    const storage = getReplitStorageClient();
    let storedInObjectStorage = false;
    let storageError: unknown = null;
    try {
      const uploadResult = await storage.uploadFromBytes(filename, buffer);
      if (uploadResult.ok) {
        storedInObjectStorage = true;
      } else {
        storageError = uploadResult.error;
      }
    } catch (err) {
      storageError = err;
    }

    if (!storedInObjectStorage) {
      if (!ALLOW_LOCAL_FILE_FALLBACK) {
        console.error("Storage upload error:", storageError);
        return NextResponse.json(
          { error: "Failed to store file" },
          { status: 500 }
        );
      }

      try {
        // Local dev fallback when object storage sidecar is unavailable.
        await mkdir(LOCAL_WORKSPACE_UPLOAD_DIR, { recursive: true });
        await writeFile(path.join(LOCAL_WORKSPACE_UPLOAD_DIR, filename), buffer);
      } catch (localErr) {
        console.error("Storage upload error:", storageError);
        console.error("Local fallback write error:", localErr);
        return NextResponse.json(
          { error: "Failed to store file" },
          { status: 500 }
        );
      }
    }

    const fileUrl = `/api/files/${filename}`;
    
    return NextResponse.json({ 
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      process.env.NODE_ENV === "development"
        ? { error: "Failed to upload file", detail: error?.message || String(error) }
        : { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
