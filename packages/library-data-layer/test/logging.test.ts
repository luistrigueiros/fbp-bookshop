import { describe, it, expect } from "bun:test";
import {
  setupLogging,
  getLibraryLogger,
  layerLogger,
  loaderLogger,
} from "@/index";

describe("Logging Utilities", () => {
  it("should be able to setup logging multiple times senza error", async () => {
    // Already setup in test env (if any test ran) or we call it here
    await setupLogging();
    await setupLogging(); // Second call should be safe
    expect(true).toBe(true);
  });

  it("should return a logger for a category", () => {
    const logger = getLibraryLogger(["test", "category"]);
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
  });

  it("should have pre-defined loggers", () => {
    expect(layerLogger).toBeDefined();
    expect(loaderLogger).toBeDefined();
  });

  it("should be able to log messages", () => {
    // This mostly exercises the LogTape interface
    layerLogger.debug("Test debug message");
    layerLogger.info("Test info message");
    expect(true).toBe(true);
  });
});
