import { describe, expect, it } from "vitest";
import { getArticleImageUrl, getYouTubeEmbedUrl } from "./article-visual-media";

describe("Visual Mode YouTube URLs", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    "https://m.youtube.com/shorts/dQw4w9WgXcQ",
    "https://youtube.com/live/dQw4w9WgXcQ",
    "//www.youtube.com/embed/dQw4w9WgXcQ",
  ])("normalizes supported YouTube links: %s", src => {
    expect(getYouTubeEmbedUrl(src)).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1&rel=0");
  });

  it.each([
    "javascript:alert(1)", "https://youtube.com.evil.test/embed/dQw4w9WgXcQ",
    "https://notyoutube.com/embed/dQw4w9WgXcQ", "https://youtube.com@evil.test/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/bad", "https://youtu.be/",
    "https://www.youtube.com/playlist?list=private",
    "https://user:password@youtube.com/embed/dQw4w9WgXcQ",
    "https://youtube.com:444/embed/dQw4w9WgXcQ",
    "data:text/html,hello",
  ])("rejects unsupported or unsafe URLs: %s", src => {
    expect(getYouTubeEmbedUrl(src)).toBeNull();
  });

  it("preserves a valid start time, strips tracking and autoplay, and only opts into autoplay explicitly", () => {
    const src = "https://youtu.be/dQw4w9WgXcQ?t=1m30s&si=tracking&autoplay=1&origin=https://evil.test";
    const url = new URL(getYouTubeEmbedUrl(src)!);
    expect(url.searchParams.get("start")).toBe("90");
    expect(url.searchParams.has("si")).toBe(false);
    expect(url.searchParams.has("origin")).toBe(false);
    expect(url.searchParams.has("autoplay")).toBe(false);
    expect(new URL(getYouTubeEmbedUrl(src, true)!).searchParams.get("autoplay")).toBe("1");
  });
});

describe("Visual Mode image URLs", () => {
  it.each(["/api/files/article-cover.jpg", "https://images.example.test/article.jpg", "http://images.example.test/image.gif"])("accepts article image URLs: %s", src => {
    expect(getArticleImageUrl(src)).toBe(src);
  });
  it.each(["", "//evil.test/image.jpg", "/\\evil.test/image.jpg", "javascript:alert(1)", "data:text/html,hello", "https://user:password@images.example.test/image.jpg", "/image\n.jpg"])("rejects unsafe URLs: %s", src => {
    expect(getArticleImageUrl(src)).toBeNull();
  });
});
