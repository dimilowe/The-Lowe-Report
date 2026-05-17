import { Storage } from "@google-cloud/storage";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

function getStorageClient(): Storage {
  return new Storage({
    credentials: {
      audience: "replit",
      subject_token_type: "access_token",
      token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
      type: "external_account",
      credential_source: {
        url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
        format: {
          type: "json",
          subject_token_field_name: "access_token",
        },
      },
      universe_domain: "googleapis.com",
    } as object,
    projectId: "",
  });
}

function getBucketAndPrefix(): { bucketName: string; prefix: string } {
  const privateDir = process.env.PRIVATE_OBJECT_DIR || "";
  if (privateDir) {
    const parts = privateDir.replace(/^\//, "").split("/");
    return {
      bucketName: parts[0],
      prefix: parts.slice(1).join("/"),
    };
  }

  const publicPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
  const firstPath = publicPaths.split(",")[0]?.trim() || "";
  if (firstPath) {
    const parts = firstPath.replace(/^\//, "").split("/");
    return {
      bucketName: parts[0],
      prefix: parts.slice(1).join("/"),
    };
  }

  throw new Error(
    "Object storage not configured: set PRIVATE_OBJECT_DIR or PUBLIC_OBJECT_SEARCH_PATHS"
  );
}

export interface StorageResult<T> {
  ok: boolean;
  value?: T;
  error?: unknown;
}

class GCSStorageClient {
  async uploadFromBytes(
    filename: string,
    data: Buffer
  ): Promise<StorageResult<void>> {
    try {
      const { bucketName, prefix } = getBucketAndPrefix();
      const objectName = prefix ? `${prefix}/${filename}` : filename;
      const storage = getStorageClient();
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(data);
      return { ok: true };
    } catch (err) {
      console.error("GCS uploadFromBytes error:", err);
      return { ok: false, error: err };
    }
  }

  async downloadAsBytes(
    filename: string
  ): Promise<StorageResult<Buffer>> {
    try {
      const { bucketName, prefix } = getBucketAndPrefix();
      const objectName = prefix ? `${prefix}/${filename}` : filename;
      const storage = getStorageClient();
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(objectName);
      const [contents] = await file.download();
      return { ok: true, value: contents };
    } catch (err) {
      console.error("GCS downloadAsBytes error:", err);
      return { ok: false, error: err };
    }
  }
}

let client: GCSStorageClient | null = null;

export function getReplitStorageClient(): GCSStorageClient {
  if (!client) {
    client = new GCSStorageClient();
  }
  return client;
}
