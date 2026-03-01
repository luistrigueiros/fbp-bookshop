import { MiddlewareHandler } from 'hono'
import { initDB, validateDB, type DB } from 'library-data-layer'
import { D1Database } from "@cloudflare/workers-types"

export type Variables = {
    db: DB
}

/**
 * Middleware that initializes and validates the database connection.
 * Sets the 'db' variable in the context for downstream handlers.
 */
export const dbValidationMiddleware = (): MiddlewareHandler<{
    Bindings: { DB: D1Database }
    Variables: Variables
}> => {
    return async (c, next) => {
        // 1. Initialize the database from bindings
        const db = initDB(c.env.DB)

        // 2. Validate the database schema and migrations
        const validation = await validateDB(db)
        if (!validation.success) {
            return c.json(
                { error: `Database validation failed: ${validation.error}` },
                503
            )
        }

        // 3. Set db in context and proceed
        c.set('db', db)
        await next()
    }
}
