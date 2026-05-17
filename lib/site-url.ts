export function getSiteUrl(): string {
  const fromSiteUrl = process.env.SITE_URL?.trim();
  if (fromSiteUrl) return normalizeOrigin(fromSiteUrl);

  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromPublic) return normalizeOrigin(fromPublic);

  const fromReplit = process.env.REPLIT_DOMAINS?.trim();
  if (fromReplit) return normalizeOrigin(`https://${fromReplit}`);

  return "https://thelowereport.com";
}

function normalizeOrigin(input: string): string {
  try {
    const url = new URL(input);
    return url.origin;
  } catch {
    return input.replace(/\/+$/, "");
  }
}
