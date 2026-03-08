export declare const trpc: {
    books: {
        list: {
            query: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"query", {
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
                title: string;
                author: string | null;
                isbn: string | null;
                barcode: string | null;
                price: number | null;
                language: string | null;
                genderId: number | null;
                publisherId: number | null;
            }[]>>;
        };
        getById: {
            query: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"query", {
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
            }, {
                id: number;
                title: string;
                author: string | null;
                isbn: string | null;
                barcode: string | null;
                price: number | null;
                language: string | null;
                genderId: number | null;
                publisherId: number | null;
            }>>;
        };
        create: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
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
                    title: string;
                    author?: string | null | undefined;
                    isbn?: string | null | undefined;
                    barcode?: string | null | undefined;
                    price?: number | null | undefined;
                    language?: string | null | undefined;
                    genderId?: number | null | undefined;
                    publisherId?: number | null | undefined;
                };
                _input_out: {
                    title: string;
                    author?: string | null | undefined;
                    isbn?: string | null | undefined;
                    barcode?: string | null | undefined;
                    price?: number | null | undefined;
                    language?: string | null | undefined;
                    genderId?: number | null | undefined;
                    publisherId?: number | null | undefined;
                };
                _output_in: typeof import("@trpc/server").unsetMarker;
                _output_out: typeof import("@trpc/server").unsetMarker;
            }, {
                id: number;
                title: string;
                author: string | null;
                isbn: string | null;
                barcode: string | null;
                price: number | null;
                language: string | null;
                genderId: number | null;
                publisherId: number | null;
            }>>;
        };
        update: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
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
                        title: string;
                        author?: string | null | undefined;
                        isbn?: string | null | undefined;
                        barcode?: string | null | undefined;
                        price?: number | null | undefined;
                        language?: string | null | undefined;
                        genderId?: number | null | undefined;
                        publisherId?: number | null | undefined;
                    };
                };
                _input_out: {
                    id: number;
                    data: {
                        title: string;
                        author?: string | null | undefined;
                        isbn?: string | null | undefined;
                        barcode?: string | null | undefined;
                        price?: number | null | undefined;
                        language?: string | null | undefined;
                        genderId?: number | null | undefined;
                        publisherId?: number | null | undefined;
                    };
                };
                _output_in: typeof import("@trpc/server").unsetMarker;
                _output_out: typeof import("@trpc/server").unsetMarker;
            }, {
                id: number;
                title: string;
                author: string | null;
                isbn: string | null;
                barcode: string | null;
                price: number | null;
                language: string | null;
                genderId: number | null;
                publisherId: number | null;
            }>>;
        };
        delete: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
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
            }, null>>;
        };
    };
    genders: {
        list: {
            query: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"query", {
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
            }[]>>;
        };
        create: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
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
            }>>;
        };
    };
    publishers: {
        list: {
            query: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"query", {
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
            }[]>>;
        };
        create: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
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
            }>>;
        };
    };
};
