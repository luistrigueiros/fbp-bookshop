import { mock } from "bun:test";

mock.module("cloudflare:workers", () => {
  return {
    DurableObject: class {
      ctx: any;
      env: any;
      constructor(ctx: any, env: any) {
        this.ctx = ctx;
        this.env = env;
      }
    },
  };
});
