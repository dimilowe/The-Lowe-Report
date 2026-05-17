import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { UserSessionData, userSessionOptions } from "@/lib/user-session";
import { getReplitStorageClient } from "@/lib/objectStorage/replitClient";

function extractTimestamp(filename: string): number {
  const patterns = [
    /^blog-(\d+)-/,
    /^product-(\d+)-/,
    /^media-(\d+)-/,
    /^image-(\d+)-/,
    /^upload-(\d+)-/,
    /[_-](\d{13})\./,
    /[_-](\d{13})[_-]/,
    /^(\d{13})[_-]/,
  ];
  
  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match && match[1]) {
      const timestamp = parseInt(match[1]);
      if (timestamp > 1600000000000 && timestamp < 2100000000000) {
        return timestamp;
      }
    }
  }
  
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<UserSessionData>(await cookies(), userSessionOptions);
    
    if (!session.isLoggedIn || !session.isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const filesResult = await getReplitStorageClient().list();
    
    if (!filesResult.ok) {
      console.error("Storage list error:", filesResult.error);
      return NextResponse.json(
        { error: "Failed to list files from storage" },
        { status: 500 }
      );
    }

    const allFiles = filesResult.value ?? [];
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const imageFiles = allFiles.filter((file: any) => {
      const filename = file.name || file.key || file;
      if (typeof filename !== 'string') return false;
      
      const ext = filename.split('.').pop()?.toLowerCase();
      return ext && imageExtensions.includes(ext);
    });

    const images = imageFiles.map((file: any) => {
      const filename = file.name || file.key || file;
      const uploadedAt = extractTimestamp(filename);
      
      return {
        filename: filename,
        url: `/api/files/${filename}`,
        uploadedAt: uploadedAt
      };
    });

    images.sort((a: any, b: any) => b.uploadedAt - a.uploadedAt);

    return NextResponse.json({ 
      success: true, 
      images 
    });
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { error: "Failed to load media library" },
      { status: 500 }
    );
  }
}
