export declare const trpc: {
    books: {
        list: {
            query: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"query", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
                _input_in: {
                    title?: string | undefined;
                    author?: string | undefined;
                    publisherId?: number | undefined;
                    limit?: number | undefined;
                    offset?: number | undefined;
                    genreId?: number | undefined;
                } | undefined;
                _input_out: {
                    limit: number;
                    offset: number;
                    title?: string | undefined;
                    author?: string | undefined;
                    publisherId?: number | undefined;
                    genreId?: number | undefined;
                };
                _output_in: typeof import("@trpc/server").unsetMarker;
                _output_out: typeof import("@trpc/server").unsetMarker;
            }, {
                data: import("library-data-layer").BookWithRelations[];
                total: number;
            }>>;
        };
        getById: {
            query: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"query", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
                _input_in: number;
                _input_out: number;
                _output_in: typeof import("@trpc/server").unsetMarker;
                _output_out: typeof import("@trpc/server").unsetMarker;
            }, import("library-data-layer").BookWithRelations>>;
        };
        create: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
                _input_in: {
                    title: string;
                    author?: string | null | undefined;
                    isbn?: string | null | undefined;
                    barcode?: string | null | undefined;
                    price?: number | null | undefined;
                    language?: string | null | undefined;
                    genreIds?: number[] | undefined;
                    publisherId?: number | null | undefined;
                };
                _input_out: {
                    title: string;
                    author?: string | null | undefined;
                    isbn?: string | null | undefined;
                    barcode?: string | null | undefined;
                    price?: number | null | undefined;
                    language?: string | null | undefined;
                    genreIds?: number[] | undefined;
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
                publisherId: number | null;
            }>>;
        };
        update: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
                _input_in: {
                    id: number;
                    data: {
                        title: string;
                        author?: string | null | undefined;
                        isbn?: string | null | undefined;
                        barcode?: string | null | undefined;
                        price?: number | null | undefined;
                        language?: string | null | undefined;
                        genreIds?: number[] | undefined;
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
                        genreIds?: number[] | undefined;
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
                publisherId: number | null;
            }>>;
        };
        delete: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
                _input_in: number;
                _input_out: number;
                _output_in: typeof import("@trpc/server").unsetMarker;
                _output_out: typeof import("@trpc/server").unsetMarker;
            }, null>>;
        };
    };
    genres: {
        list: {
            query: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"query", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _ctx_out: import("library-trpc").tRPCContext;
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
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
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
        update: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
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
            } | undefined>>;
        };
        delete: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
                _input_in: number;
                _input_out: number;
                _output_in: typeof import("@trpc/server").unsetMarker;
                _output_out: typeof import("@trpc/server").unsetMarker;
            }, boolean>>;
        };
    };
    publishers: {
        list: {
            query: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"query", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _ctx_out: import("library-trpc").tRPCContext;
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
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
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
        update: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
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
            } | undefined>>;
        };
        delete: {
            mutate: import("@trpc/client").Resolver<import("@trpc/server").BuildProcedure<"mutation", {
                _config: import("@trpc/server").RootConfig<{
                    ctx: import("library-trpc").tRPCContext;
                    meta: object;
                    errorShape: import("@trpc/server").DefaultErrorShape;
                    transformer: import("@trpc/server").DefaultDataTransformer;
                }>;
                _meta: object;
                _ctx_out: import("library-trpc").tRPCContext;
                _input_in: number;
                _input_out: number;
                _output_in: typeof import("@trpc/server").unsetMarker;
                _output_out: typeof import("@trpc/server").unsetMarker;
            }, boolean>>;
        };
    };
};
