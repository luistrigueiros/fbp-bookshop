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
 * @param options - Configuration options, e.g., { environment: "production" }
 */
export async function setupLogging(options?: { environment?: string }) {
  if (isLoggingConfigured) return;

  // Detect if we are in a deployed Cloudflare environment
  // Miniflare sets globalThis.MINIFLARE = true
  // Cloudflare Workers (both Miniflare and Prod) set navigator.userAgent = "Cloudflare-Workers"
  const isMiniflare = (globalThis as any).MINIFLARE === true;
  const isCloudflare = (globalThis as any).navigator?.userAgent === "Cloudflare-Workers";
  
  // We want plain text only when deployed to Cloudflare production
  const usePlainText = options?.environment === "production" || (isCloudflare && !isMiniflare);

  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: usePlainText ? defaultTextFormatter : defaultConsoleFormatter,
      }),
    },
    filters: {},
    loggers: [
      {
        category: ["library"],
        lowestLevel: "debug",
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
