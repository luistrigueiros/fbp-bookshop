export declare const router: <TProcRouterRecord extends import("@trpc/server").ProcedureRouterRecord>(procedures: TProcRouterRecord) => import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
    ctx: {
        req: Request<unknown, CfProperties<unknown>>;
        resHeaders: Headers;
        db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../library-data-layer/dist/schema")> & {
            $client: D1Database;
        };
        repositories: import("library-data-layer").LibraryRepositories;
        env: import("./context").Env;
    };
    meta: object;
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: import("@trpc/server").DefaultDataTransformer;
}>, TProcRouterRecord>;
export declare const publicProcedure: import("@trpc/server").ProcedureBuilder<{
    _config: import("@trpc/server").RootConfig<{
        ctx: {
            req: Request<unknown, CfProperties<unknown>>;
            resHeaders: Headers;
            db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../library-data-layer/dist/schema")> & {
                $client: D1Database;
            };
            repositories: import("library-data-layer").LibraryRepositories;
            env: import("./context").Env;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>;
    _ctx_out: {
        req: Request<unknown, CfProperties<unknown>>;
        resHeaders: Headers;
        db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../library-data-layer/dist/schema")> & {
            $client: D1Database;
        };
        repositories: import("library-data-layer").LibraryRepositories;
        env: import("./context").Env;
    };
    _input_in: typeof import("@trpc/server").unsetMarker;
    _input_out: typeof import("@trpc/server").unsetMarker;
    _output_in: typeof import("@trpc/server").unsetMarker;
    _output_out: typeof import("@trpc/server").unsetMarker;
    _meta: object;
}>;
