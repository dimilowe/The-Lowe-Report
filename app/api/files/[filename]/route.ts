import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { Buffer } from "buffer";
import { getReplitStorageClient } from "@/lib/objectStorage/replitClient";

const LOCAL_WORKSPACE_UPLOAD_DIR = path.join(process.cwd(), "tmp", "workspace-uploads");
const ALLOW_LOCAL_FILE_FALLBACK = process.env.NODE_ENV !== "production";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename: rawFilename } = await params;
    const filename = path.basename(rawFilename);

    const result = await getReplitStorageClient().downloadAsBytes(filename);

    let responseBuffer: Buffer | null = null;
    if (result.ok && result.value) {
      responseBuffer = result.value;
    } else if (ALLOW_LOCAL_FILE_FALLBACK) {
      try {
        const localPath = path.join(LOCAL_WORKSPACE_UPLOAD_DIR, filename);
        responseBuffer = await readFile(localPath);
      } catch {
        console.error("File download error:", !result.ok ? result.error : "unknown");
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
    } else {
      console.error("File download error:", !result.ok ? result.error : "unknown");
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
    };

    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';

    const arrayBuffer = responseBuffer.buffer.slice(
      responseBuffer.byteOffset,
      responseBuffer.byteOffset + responseBuffer.byteLength
    ) as ArrayBuffer;

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error("File download error:", error);
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
