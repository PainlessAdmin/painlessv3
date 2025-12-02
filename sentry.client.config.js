import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://683044f4edd65407160fd61683caa1b7@o4510464560988160.ingest.de.sentry.io/4510464568787024",
  sendDefaultPii: true,

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions

  // Only enable in production
  enabled: import.meta.env.PROD,
});
