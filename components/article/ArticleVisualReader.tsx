"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  getYouTubeEmbedUrl,
  prepareVisualArticle,
  type ArticleVisualMedia,
} from "@/lib/article-visual-media";
import styles from "./ArticleVisualReader.module.css";

interface ArticleVisualReaderProps {
  content: string;
  title: string;
  featuredImage?: string | null;
  articleKey: string;
}

interface PreparedArticle {
  html: string;
  media: ArticleVisualMedia[];
}

interface SavedIframeSource {
  iframe: HTMLIFrameElement;
  hadSrc: boolean;
  src: string | null;
}

function makeSelectableArticle(html: string): string {
  const documentCopy = new DOMParser().parseFromString(html, "text/html");

  // The normal article remains mounted underneath the modal. Avoid duplicate
  // fragment targets and IDs in the visual reader copy.
  documentCopy.body.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  documentCopy.body.querySelectorAll("[data-visual-media-id]").forEach((element) => {
    if (element.tagName.toLowerCase() === "img") {
      const image = element as HTMLImageElement;
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", image.alt ? `View image: ${image.alt}` : "View article image");
    } else if (
      !["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"].includes(element.tagName)
    ) {
      (element as HTMLElement).tabIndex = 0;
      element.setAttribute("role", "button");
    }
  });

  return documentCopy.body.innerHTML;
}

function Icon({
  name,
  className,
}: {
  name: "close" | "previous" | "next" | "play" | "image";
  className?: string;
}) {
  const shared = {
    className,
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (name === "close") {
    return <svg {...shared}><path d="m6 6 12 12M18 6 6 18" /></svg>;
  }
  if (name === "previous") {
    return <svg {...shared}><path d="m15 18-6-6 6-6" /></svg>;
  }
  if (name === "next") {
    return <svg {...shared}><path d="m9 18 6-6-6-6" /></svg>;
  }
  if (name === "play") {
    return <svg {...shared}><path d="m9 6 10 6-10 6z" fill="currentColor" stroke="none" /></svg>;
  }
  return <svg {...shared}><rect x="3" y="4" width="18" height="16" rx="1" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></svg>;
}

export default function ArticleVisualReader({
  content,
  title,
  featuredImage,
  articleKey,
}: ArticleVisualReaderProps) {
  const articleRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const openingScrollY = useRef(0);
  const [prepared, setPrepared] = useState<PreparedArticle | null>(null);
  const [active, setActive] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectionWasExplicit, setSelectionWasExplicit] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [failedImageId, setFailedImageId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const result = prepareVisualArticle(content, featuredImage);
    setPrepared({
      html: makeSelectableArticle(result.html),
      media: result.media,
    });
  }, [content, featuredImage]);

  useEffect(() => {
    articleRef.current?.toggleAttribute("inert", active);
  }, [active]);

  const selectedMedia = useMemo(
    () => prepared?.media.find((item) => item.id === selectedId) ?? null,
    [prepared, selectedId],
  );

  const stopBackgroundMedia = useCallback((): (() => void) => {
    const savedSources: SavedIframeSource[] = [];
    document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((mediaElement) => {
      mediaElement.pause();
    });

    // Removing an iframe src unloads the player without mutating its other
    // attributes. Restore the exact src attribute when Visual Mode closes.
    articleRef.current?.querySelectorAll<HTMLIFrameElement>("iframe").forEach((iframe) => {
      savedSources.push({
        iframe,
        hadSrc: iframe.hasAttribute("src"),
        src: iframe.getAttribute("src"),
      });
      iframe.removeAttribute("src");
    });

    return () => {
      savedSources.forEach(({ iframe, hadSrc, src }) => {
        if (!iframe.isConnected) return;
        if (hadSrc && src !== null) iframe.setAttribute("src", src);
        else iframe.removeAttribute("src");
      });
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    openingScrollY.current = window.scrollY;
    const bodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      width: document.body.style.width,
    };
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${openingScrollY.current}px`;
    document.body.style.left = "0";
    document.body.style.width = "100%";
    const restoreIframes = stopBackgroundMedia();
    const focusTimer = window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = bodyStyle.overflow;
      document.body.style.position = bodyStyle.position;
      document.body.style.top = bodyStyle.top;
      document.body.style.left = bodyStyle.left;
      document.body.style.width = bodyStyle.width;
      restoreIframes();
      window.scrollTo({ top: openingScrollY.current, behavior: "auto" });
      window.requestAnimationFrame(() => toggleRef.current?.focus());
    };
  }, [active, stopBackgroundMedia]);

  const openReader = () => {
    if (!prepared?.media.length) return;
    const first = prepared.media.find((item) => item.kind === "youtube") ?? prepared.media[0];
    setSelectedId(first.id);
    setSelectionWasExplicit(false);
    setActive(true);
  };

  const closeReader = useCallback(() => setActive(false), []);

  const selectMedia = useCallback((id: string) => {
    if (!prepared?.media.some((item) => item.id === id)) return;
    if (id === selectedId) return;
    setSelectedId(id);
    setSelectionWasExplicit(true);
  }, [prepared, selectedId]);

  const moveSelection = (direction: -1 | 1) => {
    if (!prepared?.media.length) return;
    const currentIndex = Math.max(0, prepared.media.findIndex((item) => item.id === selectedId));
    const nextIndex = (currentIndex + direction + prepared.media.length) % prepared.media.length;
    selectMedia(prepared.media[nextIndex].id);
  };

  const handleArticleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const selectable = target.closest<HTMLElement>("[data-visual-media-id]");
    if (!selectable) return;
    // Linked images must select the viewer instead of following their parent link.
    event.preventDefault();
    selectMedia(selectable.dataset.visualMediaId ?? "");
  };

  const handleArticleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target as HTMLElement;
    const selectable = target.closest<HTMLElement>("[data-visual-media-id]");
    if (!selectable || ["BUTTON", "A"].includes(selectable.tagName)) return;
    event.preventDefault();
    selectMedia(selectable.dataset.visualMediaId ?? "");
  };

  const handleOverlayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeReader();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], iframe, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const embedUrl =
    selectedMedia?.kind === "youtube"
      ? getYouTubeEmbedUrl(selectedMedia.src, selectionWasExplicit)
      : null;

  return (
    <>
      {prepared?.media.length ? (
        <div className={styles.modePrompt}>
          <span className={styles.promptRule} aria-hidden="true" />
          <span className={styles.promptText}>
            {prepared.media.length} {prepared.media.length === 1 ? "visual" : "visuals"} in this story
          </span>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            onClick={openReader}
            aria-haspopup="dialog"
            aria-label={`Open visual mode for ${title}`}
          >
            Visual Mode
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      ) : null}

      <div
        ref={articleRef}
        className="blog-article-body mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
        aria-hidden={active ? true : undefined}
      />

      {active && prepared && mounted
        ? createPortal(
            <div
              ref={overlayRef}
              className={styles.overlay}
              role="dialog"
              aria-modal="true"
              aria-label={`Visual mode: ${title}`}
              onKeyDown={handleOverlayKeyDown}
            >
              <header className={styles.topBar}>
                <div className={styles.editionMark}>
                  <span className={styles.markDot} aria-hidden="true" />
                  <span>The Lowe Report</span>
                  <span className={styles.markDivider} aria-hidden="true" />
                  <span className={styles.modeLabel}>Visual mode</span>
                </div>
                <button
                  ref={closeRef}
                  className={styles.closeButton}
                  onClick={closeReader}
                  type="button"
                  aria-label="Close visual mode and return to article"
                >
                  <span>Back to article</span>
                  <Icon name="close" />
                </button>
              </header>

              <section className={styles.viewer} aria-label="Selected article media">
                <div className={styles.viewerHeading}>
                  <p className={styles.storyTitle}>{title}</p>
                  <p className={styles.mediaCount}>
                    {String(Math.max(0, prepared.media.findIndex((item) => item.id === selectedId)) + 1).padStart(2, "0")}
                    <span> / </span>
                    {String(prepared.media.length).padStart(2, "0")}
                  </p>
                </div>

                <div className={styles.mediaStage}>
                  {selectedMedia?.kind === "youtube" && embedUrl ? (
                    <iframe
                      key={`${articleKey}:${selectedMedia.id}`}
                      className={styles.videoFrame}
                      src={embedUrl}
                      title={selectedMedia.title || title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : selectedMedia?.kind === "image" && failedImageId === selectedMedia.id ? (
                    <p className={styles.noSelection} role="status">
                      This image couldn’t be loaded. Choose another visual below.
                    </p>
                  ) : selectedMedia?.kind === "image" ? (
                    <img
                      key={`${articleKey}:${selectedMedia.id}`}
                      className={styles.viewerImage}
                      src={selectedMedia.src}
                      alt={selectedMedia.alt || selectedMedia.title || ""}
                      onError={() => setFailedImageId(selectedMedia.id)}
                    />
                  ) : (
                    <div className={styles.noSelection}>Choose a visual from the story below.</div>
                  )}
                </div>

                <div className={styles.viewerFooter}>
                  <div className={styles.mediaCaption}>
                    <span className={styles.mediaType}>
                      {selectedMedia?.kind === "youtube" ? (
                        <><Icon name="play" /> Video</>
                      ) : (
                        <><Icon name="image" /> Image</>
                      )}
                    </span>
                    <span className={styles.mediaTitle}>{selectedMedia?.title || title}</span>
                    {selectedMedia?.kind === "youtube" ? (
                      <>
                        <span className={styles.playbackHint}>If playback doesn’t start, use the player controls.</span>
                        <a
                          className={styles.youtubeLink}
                          href={`https://www.youtube.com/watch?v=${new URL(selectedMedia.src).pathname.split("/").pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >Open on YouTube</a>
                      </>
                    ) : null}
                  </div>
                  <div className={styles.navigation}>
                    <button
                      type="button"
                      className={styles.navButton}
                      onClick={() => moveSelection(-1)}
                      aria-label="Previous media"
                      disabled={prepared.media.length < 2}
                    >
                      <Icon name="previous" />
                    </button>
                    <button
                      type="button"
                      className={styles.navButton}
                      onClick={() => moveSelection(1)}
                      aria-label="Next media"
                      disabled={prepared.media.length < 2}
                    >
                      <Icon name="next" />
                    </button>
                  </div>
                </div>
              </section>

              <div className={styles.readerPane}>
                <div className={styles.readerIntro}>
                  <span className={styles.readerEyebrow}>The story</span>
                  <span className={styles.readerInstruction}>Select a marked image or video to view it above</span>
                </div>
                <div
                  className={`${styles.readerArticle} blog-article-body`}
                  onClick={handleArticleClick}
                  onKeyDown={handleArticleKeyDown}
                  dangerouslySetInnerHTML={{ __html: prepared.html }}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
