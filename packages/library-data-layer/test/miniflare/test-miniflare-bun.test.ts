import { describe, it } from "bun:test";
import { Miniflare } from "miniflare";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";

describe("Miniflare Reproduction", () => {
  it("should initialize and get bindings", async () => {
    const baseTmp = await mkdtemp(join(tmpdir(), "mf-d1-repro-"));

    console.log("Creating Miniflare...");
    const mf = new Miniflare({
      modules: true,
      script: "export default { fetch(){ return new Response('ok') } }",
      d1Databases: {
        DB: "DB",
      },
      d1Persist: join(baseTmp, "d1"),
      compatibilityDate: "2024-01-01",
    });

    console.log("Getting bindings...");
    const env = await mf.getBindings();
    console.log("Bindings obtained:", Object.keys(env));

    await mf.dispose();
  });
});
