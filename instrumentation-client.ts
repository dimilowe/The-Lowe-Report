const GA_MEASUREMENT_ID = "G-KFVT6C2YR0";
const GOOGLE_TAG_ID = "google-analytics-tag";

const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/api",
  "/dashboard",
  "/forgot-password",
  "/forgot-username",
  "/login",
  "/reset-password",
  "/saved",
  "/settings",
  "/signup",
  "/workspace",
  "/vcm-os",
];

declare global {
  interface Window {
    dataLayer: IArguments[];
    gtag: (...args: unknown[]) => void;
  }
}

window.dataLayer = window.dataLayer || [];
window.gtag = function () {
  window.dataLayer.push(arguments);
};

window.gtag("js", new Date());
window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

const googleTag = document.createElement("script");
googleTag.id = GOOGLE_TAG_ID;
googleTag.async = true;
googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
document.head.appendChild(googleTag);

function trackPageView(url: string) {
  const pageUrl = new URL(url, window.location.origin);
  const isPrivateRoute = PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pageUrl.pathname === prefix || pageUrl.pathname.startsWith(`${prefix}/`),
  );

  if (pageUrl.origin !== window.location.origin || isPrivateRoute) return;

  window.gtag("event", "page_view", {
    page_location: `${pageUrl.origin}${pageUrl.pathname}`,
  });
}

trackPageView(window.location.href);

export function onRouterTransitionStart(url: string) {
  trackPageView(url);
}
