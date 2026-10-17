/**
 * Voluntary Support & Tipping Configuration
 * 
 * Supports reusable Wise Payment Links (handling Apple Pay, Card, Google Pay, and Wise transfers).
 * Configurable via NEXT_PUBLIC_WISE_TIP_URL.
 */

export const SUPPORT_CONFIG = {
  /**
   * Whether voluntary tip buttons & banners are visible in the UI.
   * Disabled until payment link is set up.
   */
  enabled: false,

  /**
   * The destination Wise payment link URL.
   * Can be configured via NEXT_PUBLIC_WISE_TIP_URL in .env.local / Vercel.
   */
  wiseUrl:
    process.env.NEXT_PUBLIC_WISE_TIP_URL?.trim() ||
    "https://wise.com/pay/me",

  /**
   * Title and description copy for the support dialog and contextual card.
   */
  title: "Support Sim-Cap Studio",
  subtitle: "Help keep this tool free, ad-free, and actively developed",
  description:
    "Sim-Cap Studio is a free, open-source utility built for sim racers and 3D printing enthusiasts. If this tool saved you hours of CAD modeling or helped finish your wheel build, a small tip helps cover filament testing, server hosting, and new wheel profiles!",

  /**
   * Key features of the Wise payment link to inform users
   */
  paymentMethods: [
    "Apple Pay & Google Pay",
    "Credit & Debit Cards",
    "Direct Wise Transfer",
    "Zero account creation required",
  ],

  /**
   * LocalStorage key to remember user banner dismissal
   */
  dismissStorageKey: "simcap_support_banner_dismissed",
};

export type SupportClickLocation =
  | "header"
  | "export_banner"
  | "footer"
  | "modal";

/**
 * Observability & Analytics tracker for support/tip interactions.
 * Hooks into window.gtag, window.posthog, window.plausible, and emits a CustomEvent.
 */
export const trackSupportClick = (
  location: SupportClickLocation,
  metadata?: Record<string, unknown>
) => {
  if (typeof window === "undefined") return;

  const payload = {
    location,
    targetUrl: SUPPORT_CONFIG.wiseUrl,
    timestamp: Date.now(),
    ...metadata,
  };

  // 1. Dispatch custom DOM event for decoupled analytics listeners
  try {
    const event = new CustomEvent("simcap:support_click", {
      detail: payload,
    });
    window.dispatchEvent(event);
  } catch {
    // Ignore in unsupported environments
  }

  // 2. Forward to common global analytics platforms if loaded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;

  if (typeof win.gtag === "function") {
    win.gtag("event", "support_click", {
      event_category: "monetization",
      event_label: location,
      ...metadata,
    });
  }

  if (win.posthog && typeof win.posthog.capture === "function") {
    win.posthog.capture("support_click", payload);
  }

  if (typeof win.plausible === "function") {
    win.plausible("SupportClick", { props: { location, ...metadata } });
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[Support Analytics] Tipping clicked from "${location}":`, payload);
  }
};
