import { describe, it, expect, beforeAll } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { $ } from "bun";

describe("Frontend Build Verification", () => {
  beforeAll(async () => {
    // Run the build for the frontend before asserting to ensure it parses without errors
    await $`bun run build:frontend`;
  }, 30000);

  it("should generate index.html in dist/public", () => {
    const indexPath = join(process.cwd(), "dist/public/index.html");
    expect(existsSync(indexPath)).toBe(true);
    
    // Verify base rendering tokens are present
    const html = readFileSync(indexPath, "utf-8");
    expect(html).toContain('id="root"');
    expect(html).toContain('script type="module"');
  });

  it("should generate the compiled CSS and JS assets", () => {
    const assetsPath = join(process.cwd(), "dist/public/assets");
    expect(existsSync(assetsPath)).toBe(true);
  });
});
