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

  const isProduction = options?.environment === "production";

  await configure({
    sinks: {
      console: getConsoleSink({
        formatter: isProduction ? defaultTextFormatter : defaultConsoleFormatter,
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
