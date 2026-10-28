"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Delivery = {
  fill: boolean;
  reason?: string;
  destroy?: () => void;
  trackConversion?: () => Promise<void>;
};
type AdCoreClient = {
  render: (container: HTMLElement, options: { placement: string; signal: AbortSignal }) => Promise<Delivery>;
};
declare global {
  interface Window {
    VCMAdCore?: new (options: { baseUrl: string; app: string }) => AdCoreClient;
  }
}

type AdSlotProps = {
  placement: string;
  className?: string;
  /** Space reserved while the request loads; adjust for the selected inventory. */
  reserveHeight?: number;
  /** Set to false until your site's decision about showing ads permits loading. */
  enabled?: boolean;
  /** Change this for a new article/page when this component remains mounted. */
  refreshKey?: string;
};

const configuredUrl = process.env.NEXT_PUBLIC_ADCORE_URL?.trim();
const appName = process.env.NEXT_PUBLIC_ADCORE_APP_NAME?.trim() || "The Lowe Report";
function readOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (process.env.NODE_ENV === "production" && local) return null;
    if (url.username || url.password || !["http:", "https:"].includes(url.protocol)) return null;
    if (url.protocol !== "https:" && (process.env.NODE_ENV === "production" || !local)) return null;
    return url.origin;
  } catch { return null; }
}
const baseUrl = readOrigin(configuredUrl);

/** The SDK owns rendering and impression tracking for this placement. */
export default function AdSlot({ placement, className = "", reserveHeight = 100, enabled = true, refreshKey = "" }: AdSlotProps) {
  const container = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const [result, setResult] = useState<{ key: string; status: "filled" | "empty" | "error" } | null>(null);
  const requestKey = `${placement}:${refreshKey}`;
  const status = result?.key === requestKey ? result.status : "loading";

  useEffect(() => {
    if (!enabled || !baseUrl || !sdkReady || !window.VCMAdCore || !container.current) return;
    const controller = new AbortController();
    let delivery: Delivery | undefined;
    const client = new window.VCMAdCore({ baseUrl, app: appName });
    const timeout = setTimeout(() => {
      if (!delivery) {
        controller.abort();
        setResult({ key: requestKey, status: "error" });
      }
    }, 8000);
    client.render(container.current, { placement, signal: controller.signal }).then(ad => {
      clearTimeout(timeout);
      if (controller.signal.aborted) { ad.destroy?.(); return; }
      delivery = ad;
      setResult({ key: requestKey, status: ad.fill ? "filled" : "empty" });
    }).catch(() => {
      clearTimeout(timeout);
      if (!controller.signal.aborted) setResult({ key: requestKey, status: "error" });
    });
    return () => {
      clearTimeout(timeout);
      controller.abort();
      delivery?.destroy?.();
    };
  }, [enabled, sdkReady, placement, refreshKey, requestKey]);

  if (!enabled || !baseUrl) return null;
  return <>
    <Script id="vcm-adcore-sdk" src={`${baseUrl}/adcore.js`} strategy="afterInteractive"
      onReady={() => { setScriptFailed(false); setSdkReady(true); }}
      onError={() => setScriptFailed(true)} />
    <aside aria-label="Advertisement" className={className}
      hidden={scriptFailed || status === "empty" || status === "error"}
      style={{ minHeight: status === "loading" ? reserveHeight : undefined }}>
      <div ref={container} />
    </aside>
  </>;
}
