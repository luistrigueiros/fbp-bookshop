import { z } from 'zod';
export declare const BookUpsertSchema: z.ZodObject<{
    title: z.ZodString;
    author: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isbn: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    language: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    genderId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    publisherId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    author?: string | null | undefined;
    isbn?: string | null | undefined;
    barcode?: string | null | undefined;
    price?: number | null | undefined;
    language?: string | null | undefined;
    genderId?: number | null | undefined;
    publisherId?: number | null | undefined;
}, {
    title: string;
    author?: string | null | undefined;
    isbn?: string | null | undefined;
    barcode?: string | null | undefined;
    price?: number | null | undefined;
    language?: string | null | undefined;
    genderId?: number | null | undefined;
    publisherId?: number | null | undefined;
}>;
export declare const BookListQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    publisherId: z.ZodOptional<z.ZodNumber>;
    genderId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    title?: string | undefined;
    author?: string | undefined;
    genderId?: number | undefined;
    publisherId?: number | undefined;
}, {
    title?: string | undefined;
    author?: string | undefined;
    genderId?: number | undefined;
    publisherId?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const booksRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
            title?: string | undefined;
            author?: string | undefined;
            genderId?: number | undefined;
            publisherId?: number | undefined;
            limit?: number | undefined;
            offset?: number | undefined;
        } | undefined;
        _input_out: {
            limit: number;
            offset: number;
            title?: string | undefined;
            author?: string | undefined;
            genderId?: number | undefined;
            publisherId?: number | undefined;
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        data: import("library-data-layer").BookWithRelations[];
        total: number;
    }>;
    getById: import("@trpc/server").BuildProcedure<"query", {
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
    }>;
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
    }>;
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
    }, null>;
}>;
