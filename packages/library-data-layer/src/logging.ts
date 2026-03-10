import {
  configure,
  getConsoleSink,
  getLogger,
  type Logger,
  defaultConsoleFormatter,
  defaultTextFormatter,
} from "@logtape/logtape";

let isLoggingConfigured = false;

/**
 * Configure LogTape for the application.
 * This should be called once at the entry point of the application/worker.
 * @param options - Configuration options, e.g., { environment: "production", lowestLevel: "warning" }
 */
export async function setupLogging(options?: {
  environment?: string;
  lowestLevel?: "debug" | "info" | "warning" | "error" | "fatal";
}) {
  if (isLoggingConfigured) return;

  // Detect if we are in a deployed Cloudflare environment
  // Miniflare sets globalThis.MINIFLARE = true
  // Cloudflare Workers (both Miniflare and Prod) set navigator.userAgent = "Cloudflare-Workers"
  const isMiniflare = (globalThis as any).MINIFLARE === true;
  const isCloudflare =
    (globalThis as any).navigator?.userAgent === "Cloudflare-Workers";

  // We want plain text only when deployed to Cloudflare production
  const usePlainText =
    options?.environment === "production" || (isCloudflare && !isMiniflare);

  // Default level is "debug" unless in production ("info") or explicitly overridden
  let lowestLevel = options?.lowestLevel;
  if (!lowestLevel) {
    lowestLevel = options?.environment === "production" ? "info" : "debug";
  }

  // Detect test environment (Bun, Node, or Cloudflare Worker in test mode)
  const isTest =
    (typeof process !== "undefined" &&
      (process.env.NODE_ENV === "test" || process.env.BUN_ENV === "test")) ||
    (globalThis as any).VITEST === "true";

  if (isTest && !options?.lowestLevel) {
    lowestLevel = "warning";
  }

  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: usePlainText
          ? defaultTextFormatter
          : defaultConsoleFormatter,
      }),
    },
    filters: {},
    loggers: [
      {
        category: ["library"],
        lowestLevel: lowestLevel,
        sinks: ["console"],
      },
    ],
  });

  isLoggingConfigured = true;
}

/**
 * Get a logger for a specific category.
 * @param category - The logger category, e.g., ["library", "data-layer"]
 */
export function getLibraryLogger(category: string[]): Logger {
  return getLogger(category);
}

// Pre-defined loggers for common components
export const layerLogger = getLibraryLogger(["library", "data-layer"]);
export const loaderLogger = getLibraryLogger(["library", "data-loader"]);
