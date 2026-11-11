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

function updateTrackingPermission(url: string) {
  const pageUrl = new URL(url, window.location.origin);
  const isPrivateRoute = PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pageUrl.pathname === prefix || pageUrl.pathname.startsWith(`${prefix}/`),
  );

  Object.assign(window, {
    [`ga-disable-${GA_MEASUREMENT_ID}`]:
      process.env.NODE_ENV !== "production" ||
      pageUrl.origin !== window.location.origin ||
      isPrivateRoute,
  });
}

updateTrackingPermission(window.location.href);
window.gtag("js", new Date());
window.gtag("config", GA_MEASUREMENT_ID, {
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
});

const googleTag = document.createElement("script");
googleTag.id = GOOGLE_TAG_ID;
googleTag.async = true;
googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
document.head.appendChild(googleTag);

export function onRouterTransitionStart(url: string) {
  // This stream's Enhanced Measurement handles history-based page views.
  // Only update its collection opt-out here; manual page views would duplicate them.
  updateTrackingPermission(url);
}
