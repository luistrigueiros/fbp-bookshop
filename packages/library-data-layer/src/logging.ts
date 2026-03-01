import { configure, getConsoleSink, getLogger, type Logger } from "@logtape/logtape";

/**
 * Configure LogTape for the application.
 * This should be called once at the entry point of the application/worker.
 */
export async function setupLogging() {
    await configure({
        sinks: {
            console: getConsoleSink(),
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
