import { Miniflare } from "miniflare";

try {
  console.log("Initializing Miniflare...");
  const mf = new Miniflare({
    modules: true,
    script: "export default { fetch(){ return new Response('ok') } }",
    d1Databases: {
      DB: "DB",
    },
    compatibilityDate: "2024-01-01",
  });
  console.log("Miniflare initialized.");

  const res = await mf.dispatchFetch("http://localhost");
  console.log("Fetch result:", await res.text());

  await mf.dispose();
  console.log("Disposed.");
} catch (e) {
  console.error("Error:", e);
}
