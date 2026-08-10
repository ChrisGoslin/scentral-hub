// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
//
// GDPR: Sentry is gated behind explicit user consent (lib/consent.ts) and, like
// PostHog (lib/posthog.ts), deferred until the browser is idle so it never
// blocks LCP-critical work on first paint.

import * as Sentry from "@sentry/nextjs";
import { hasErrorTrackingConsent } from "@/lib/consent";

let initialized = false;

function initSentry() {
  if (initialized || !hasErrorTrackingConsent()) return
  initialized = true
  Sentry.init({
    dsn: "https://46550f00a86c5efa01914facff8612a1@o4511640243929088.ingest.de.sentry.io/4511640247599184",

    // Add optional integrations for additional features
    integrations: [Sentry.replayIntegration()],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,
    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    dataCollection: {
      // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
      // userInfo: false,
      // httpBodies: [],
    },
  });
}

/** Schedules Sentry to initialize once the browser is idle, if consent is
 * already granted, and re-checks whenever consent changes (e.g. the banner
 * is accepted after initial decline). Call once from a root provider. */
export function initDeferred() {
  if (typeof window === "undefined") return
  const schedule = (cb: () => void) =>
    "requestIdleCallback" in window
      ? window.requestIdleCallback(cb, { timeout: 4000 })
      : setTimeout(cb, 1)
  schedule(initSentry)
  window.addEventListener("consent-changed", initSentry)
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
