export function normalizePathname(pathname: string): string {
  if (!pathname) return "/";

  let normalized = pathname;

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  normalized = normalized.replace(/\/{2,}/g, "/");
  normalized = normalized.toLowerCase();

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || "/";
}
