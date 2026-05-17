import { Pool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from "pg";
import ws from "ws";
import { recordDbQuery } from "@/lib/ops/metrics";

// Configure Neon for serverless environments (like APE)
neonConfig.webSocketConstructor = ws;

type RuntimeTarget = "dev" | "prod";
type SourceVar = "DATABASE_URL_DEV" | "DATABASE_URL_PROD" | "DATABASE_URL";
type RuntimeDbMeta = {
  target: RuntimeTarget;
  sourceVar: SourceVar;
  host: string;
  database: string;
  sslmode: string;
};

type PoolConnectClient = {
  query: (text: string) => Promise<unknown>;
};

function parseRuntimeTarget(): RuntimeTarget {
  const explicit = (process.env.DB_TARGET_RUNTIME || process.env.DB_TARGET || "").toLowerCase();
  if (explicit === "prod" || explicit === "production") return "prod";
  if (explicit === "dev" || explicit === "development") return "dev";
  return process.env.NODE_ENV === "production" ? "prod" : "dev";
}

function resolveRuntimeDatabaseUrl(): { url: string; sourceVar: SourceVar; target: RuntimeTarget } | null {
  const target = parseRuntimeTarget();
  const devUrl = process.env.DATABASE_URL_DEV;
  const prodUrl = process.env.DATABASE_URL_PROD;
  const fallback = process.env.DATABASE_URL;

  if (target === "prod") {
    if (prodUrl) return { url: prodUrl, sourceVar: "DATABASE_URL_PROD", target };
    if (fallback) return { url: fallback, sourceVar: "DATABASE_URL", target };
    return null;
  }

  if (devUrl) return { url: devUrl, sourceVar: "DATABASE_URL_DEV", target };
  if (fallback) return { url: fallback, sourceVar: "DATABASE_URL", target };
  return null;
}

function safeDbFingerprint(connectionString: string): { host: string; database: string; sslmode: string } | null {
  try {
    const parsed = new URL(connectionString);
    return {
      host: parsed.hostname || "unknown",
      database: parsed.pathname.replace(/^\/+/, "") || "unknown",
      sslmode: parsed.searchParams.get("sslmode") || "unknown",
    };
  } catch {
    return null;
  }
}

function isLocalDatabaseUrl(connectionString: string): boolean {
  try {
    const parsed = new URL(connectionString);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

const runtimeDb = resolveRuntimeDatabaseUrl();

if (!runtimeDb) {
  throw new Error(
    "No database URL configured for runtime. Set DATABASE_URL_PROD (prod) or DATABASE_URL_DEV (dev), with DATABASE_URL as fallback.",
  );
}

function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
const defaultPoolMax = isProductionBuild ? 2 : 10;
const defaultConnectTimeoutMs = isProductionBuild ? 10000 : 30000;
const defaultIdleTimeoutMs = 30000;

const poolOptions = {
  connectionString: runtimeDb.url,
  max: readPositiveIntEnv("DB_POOL_MAX", defaultPoolMax),
  idleTimeoutMillis: readPositiveIntEnv("DB_POOL_IDLE_TIMEOUT_MS", defaultIdleTimeoutMs),
  connectionTimeoutMillis: readPositiveIntEnv(
    "DB_POOL_CONNECT_TIMEOUT_MS",
    defaultConnectTimeoutMs
  ),
  allowExitOnIdle: true,
};

export const pool = isLocalDatabaseUrl(runtimeDb.url)
  ? new PgPool({ ...poolOptions, ssl: false })
  : new Pool(poolOptions);

pool.on("connect", async (client: PoolConnectClient) => {
  await client.query("SET search_path TO public");
});

const fingerprint = safeDbFingerprint(runtimeDb.url);
const runtimeDbMeta: RuntimeDbMeta = {
  target: runtimeDb.target,
  sourceVar: runtimeDb.sourceVar,
  host: fingerprint?.host || "unparseable",
  database: fingerprint?.database || "unparseable",
  sslmode: fingerprint?.sslmode || "unknown",
};
if (fingerprint) {
  console.log("[db] runtime connection selected", {
    target: runtimeDbMeta.target,
    sourceVar: runtimeDbMeta.sourceVar,
    host: runtimeDbMeta.host,
    database: runtimeDbMeta.database,
    sslmode: runtimeDbMeta.sslmode,
  });
} else {
  console.log("[db] runtime connection selected", {
    target: runtimeDbMeta.target,
    sourceVar: runtimeDbMeta.sourceVar,
    host: "unparseable",
  });
}

export function getRuntimeDbMeta(): RuntimeDbMeta {
  return runtimeDbMeta;
}

type DbErrorWithCode = {
  code?: string;
};

export function shouldSuppressDatabaseErrorDuringBuild(error: unknown): boolean {
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    return false;
  }

  const code = (error as DbErrorWithCode | null | undefined)?.code;
  return code === "42P01" || code === "3F000";
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    recordDbQuery(duration);
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    if (shouldSuppressDatabaseErrorDuringBuild(error)) {
      const duration = Date.now() - start;
      console.warn('[db] suppressing build-time query error (table may not exist yet):', (error as Error).message);
      recordDbQuery(duration);
      return { rows: [], rowCount: 0, command: '' as const, oid: 0, fields: [] };
    }
    throw error;
  }
}

export async function withTransaction<T>(
  callback: (client: { query: typeof query }) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const clientQuery = async (text: string, params?: any[]) => {
      const start = Date.now();
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      recordDbQuery(duration);
      console.log('executed query (tx)', { text, duration, rows: res.rowCount });
      return res;
    };
    const result = await callback({ query: clientQuery });
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
