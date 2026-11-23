export interface ArticleVisualMedia {
  id: string;
  kind: "youtube" | "image";
  src: string;
  title: string;
  alt?: string;
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com", "www.youtube.com", "m.youtube.com",
  "youtube-nocookie.com", "www.youtube-nocookie.com", "youtu.be", "www.youtu.be",
]);

function parseTime(value: string | null): number | null {
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!match || !match[0]) return null;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

/** Accept actual YouTube URLs only; never carry arbitrary player parameters forward. */
export function getYouTubeEmbedUrl(src: string, autoplay = false): string | null {
  try {
    const url = new URL(src.startsWith("//") ? `https:${src}` : src);
    if (!["http:", "https:"].includes(url.protocol) || !YOUTUBE_HOSTS.has(url.hostname) || url.username || url.password || url.port) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    const id = url.hostname.endsWith("youtu.be")
      ? parts[0]
      : parts[0] === "watch"
        ? url.searchParams.get("v")
        : ["embed", "shorts", "live", "v"].includes(parts[0]) ? parts[1] : null;
    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
    const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
    embed.searchParams.set("playsinline", "1");
    embed.searchParams.set("rel", "0");
    const start = parseTime(url.searchParams.get("start") || url.searchParams.get("t"));
    if (start !== null && Number.isSafeInteger(start) && start > 0 && start <= 86400) {
      embed.searchParams.set("start", String(start));
    }
    if (autoplay) embed.searchParams.set("autoplay", "1");
    return embed.toString();
  } catch {
    return null;
  }
}

export function getArticleImageUrl(src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) return trimmed;
  try {
    const url = new URL(trimmed);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
      ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Browser-only enhancement of existing CMS HTML. The original article stays
 * server-rendered; the secondary reader contains no independently playing media.
 */
export function prepareVisualArticle(content: string, featuredImage?: string | null): {
  html: string;
  media: ArticleVisualMedia[];
} {
  const doc = new DOMParser().parseFromString(content, "text/html");
  const media: ArticleVisualMedia[] = [];
  const add = (item: Omit<ArticleVisualMedia, "id">) => {
    const result = { ...item, id: `article-media-${media.length}` };
    media.push(result);
    return result;
  };
  const featured = featuredImage ? getArticleImageUrl(featuredImage) : null;
  if (featured) add({ kind: "image", src: featured, title: "Article cover", alt: "Article cover" });

  // The original CMS is trusted as before; don't activate scripts or competing
  // players when copying its markup into an interactive media-selection view.
  doc.querySelectorAll("script, object, embed, base, meta, link, form").forEach(node => node.remove());
  doc.querySelectorAll("*").forEach(node => {
    node.removeAttribute("id");
    node.removeAttribute("autofocus");
    for (const attr of Array.from(node.attributes)) {
      if (/^on/i.test(attr.name) || attr.name === "srcdoc") node.removeAttribute(attr.name);
    }
  });

  doc.querySelectorAll("iframe, img, video, audio").forEach(node => {
    if (node.tagName === "IMG") {
      const src = getArticleImageUrl(node.getAttribute("src") || "");
      if (!src) {
        node.remove();
        return;
      }
      const alt = node.getAttribute("alt") || "Article image";
      const item = add({ kind: "image", src, title: alt, alt });
      node.setAttribute("data-visual-media-id", item.id);
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("aria-label", `Show ${alt} in viewer`);
      return;
    }
    const src = node.getAttribute("src") || "";
    const embedUrl = node.tagName === "IFRAME" ? getYouTubeEmbedUrl(src) : null;
    const wrapper = node.parentElement;
    if (wrapper?.matches("[data-youtube-video], .video-container")) {
      wrapper.removeAttribute("style");
      wrapper.classList.remove("video-container");
      wrapper.removeAttribute("data-youtube-video");
    }
    if (!embedUrl) {
      const notice = doc.createElement("p");
      notice.textContent = "This embedded media is available in normal reading mode.";
      node.replaceWith(notice);
      return;
    }
    const videoNumber = media.filter(item => item.kind === "youtube").length + 1;
    const title = node.getAttribute("title") || `YouTube video ${videoNumber}`;
    const item = add({ kind: "youtube", src: embedUrl, title });
    const button = doc.createElement("button");
    button.type = "button";
    button.setAttribute("data-visual-media-id", item.id);
    button.setAttribute("data-visual-media-kind", "youtube");
    button.setAttribute("aria-label", `Play ${title} in viewer`);
    const thumb = doc.createElement("img");
    thumb.src = `https://i.ytimg.com/vi/${new URL(embedUrl).pathname.split("/").pop()}/hqdefault.jpg`;
    thumb.alt = "";
    thumb.loading = "lazy";
    const label = doc.createElement("span");
    label.textContent = `Play in viewer · ${title}`;
    button.append(thumb, label);
    node.replaceWith(button);
  });
  return { html: doc.body.innerHTML, media };
}
