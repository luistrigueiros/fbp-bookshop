import { z } from 'zod';
export declare const NamePayloadSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export declare const publishersRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
    ctx: {
        req: Request<unknown, CfProperties<unknown>>;
        resHeaders: Headers;
        db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../../library-data-layer/dist/schema")> & {
            $client: D1Database;
        };
        repositories: import("library-data-layer").LibraryRepositories;
        env: import("../context").Env;
    };
    meta: object;
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: import("@trpc/server").DefaultDataTransformer;
}>, {
    list: import("@trpc/server").BuildProcedure<"query", {
        _config: import("@trpc/server").RootConfig<{
            ctx: {
                req: Request<unknown, CfProperties<unknown>>;
                resHeaders: Headers;
                db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../../library-data-layer/dist/schema")> & {
                    $client: D1Database;
                };
                repositories: import("library-data-layer").LibraryRepositories;
                env: import("../context").Env;
            };
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _ctx_out: {
            req: Request<unknown, CfProperties<unknown>>;
            resHeaders: Headers;
            db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../../library-data-layer/dist/schema")> & {
                $client: D1Database;
            };
            repositories: import("library-data-layer").LibraryRepositories;
            env: import("../context").Env;
        };
        _input_in: typeof import("@trpc/server").unsetMarker;
        _input_out: typeof import("@trpc/server").unsetMarker;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
        _meta: object;
    }, {
        id: number;
        name: string;
    }[]>;
    create: import("@trpc/server").BuildProcedure<"mutation", {
        _config: import("@trpc/server").RootConfig<{
            ctx: {
                req: Request<unknown, CfProperties<unknown>>;
                resHeaders: Headers;
                db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../../library-data-layer/dist/schema")> & {
                    $client: D1Database;
                };
                repositories: import("library-data-layer").LibraryRepositories;
                env: import("../context").Env;
            };
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: {
            req: Request<unknown, CfProperties<unknown>>;
            resHeaders: Headers;
            db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../../library-data-layer/dist/schema")> & {
                $client: D1Database;
            };
            repositories: import("library-data-layer").LibraryRepositories;
            env: import("../context").Env;
        };
        _input_in: {
            name: string;
        };
        _input_out: {
            name: string;
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        id: number;
        name: string;
    }>;
    update: import("@trpc/server").BuildProcedure<"mutation", {
        _config: import("@trpc/server").RootConfig<{
            ctx: {
                req: Request<unknown, CfProperties<unknown>>;
                resHeaders: Headers;
                db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../../library-data-layer/dist/schema")> & {
                    $client: D1Database;
                };
                repositories: import("library-data-layer").LibraryRepositories;
                env: import("../context").Env;
            };
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: {
            req: Request<unknown, CfProperties<unknown>>;
            resHeaders: Headers;
            db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../../library-data-layer/dist/schema")> & {
                $client: D1Database;
            };
            repositories: import("library-data-layer").LibraryRepositories;
            env: import("../context").Env;
        };
        _input_in: {
            id: number;
            data: {
                name: string;
            };
        };
        _input_out: {
            id: number;
            data: {
                name: string;
            };
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        id: number;
        name: string;
    } | undefined>;
    delete: import("@trpc/server").BuildProcedure<"mutation", {
        _config: import("@trpc/server").RootConfig<{
            ctx: {
                req: Request<unknown, CfProperties<unknown>>;
                resHeaders: Headers;
                db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../../library-data-layer/dist/schema")> & {
                    $client: D1Database;
                };
                repositories: import("library-data-layer").LibraryRepositories;
                env: import("../context").Env;
            };
            meta: object;
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: import("@trpc/server").DefaultDataTransformer;
        }>;
        _meta: object;
        _ctx_out: {
            req: Request<unknown, CfProperties<unknown>>;
            resHeaders: Headers;
            db: import("drizzle-orm/d1").DrizzleD1Database<typeof import("../../../library-data-layer/dist/schema")> & {
                $client: D1Database;
            };
            repositories: import("library-data-layer").LibraryRepositories;
            env: import("../context").Env;
        };
        _input_in: number;
        _input_out: number;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, boolean>;
}>;
