import { getSiteUrl } from "@/lib/site-url";

export async function pingSearchEngines(slug: string): Promise<void> {
  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/newsletter/${slug}`;
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  await Promise.allSettled([
    pingGoogle(sitemapUrl),
    pingIndexNow(articleUrl, siteUrl),
  ]);
}

async function pingGoogle(sitemapUrl: string): Promise<void> {
  const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    console.warn(`[searchPings] Google ping failed: ${res.status}`);
  } else {
    console.log(`[searchPings] Google sitemap ping sent`);
  }
}

async function pingIndexNow(articleUrl: string, siteUrl: string): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.warn("[searchPings] INDEXNOW_KEY not set — skipping IndexNow ping");
    return;
  }

  const host = new URL(siteUrl).hostname;

  const body = {
    host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList: [articleUrl],
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (res.ok || res.status === 202) {
    console.log(`[searchPings] IndexNow ping sent for ${articleUrl}`);
  } else {
    console.warn(`[searchPings] IndexNow ping failed: ${res.status}`);
  }
}
