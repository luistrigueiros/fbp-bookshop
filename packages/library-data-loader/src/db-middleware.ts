import { MiddlewareHandler } from 'hono'
import { initDB, validateDB, runMigrations, splitMigrationStatements, type DB } from 'library-data-layer'
import { D1Database } from "@cloudflare/workers-types"
import { migrations } from '@/migrations'

export type Variables = {
    db: DB
}

/**
 * Middleware that initializes and validates the database connection.
 * Sets the 'db' variable in the context for downstream handlers.
 * In development mode, it automatically applies migrations if the DB is uninitialized.
 */
export const dbValidationMiddleware = (): MiddlewareHandler<{
    Bindings: { DB: D1Database; ENVIRONMENT?: string }
    Variables: Variables
}> => {
    return async (c, next) => {
        // 1. Initialize the database from bindings
        const db = initDB(c.env.DB)

        // 2. Validate the database schema and migrations
        let validation = await validateDB(db)

        // 3. Auto-initialize in development mode if validation fails
        if (!validation.success && c.env.ENVIRONMENT === 'development') {
            console.log(`[DEV] Database validation failed: ${validation.error}. Attempting auto-migration...`)
            try {
                if (migrations.length > 0) {
                    for (const migration of migrations) {
                        const statements = splitMigrationStatements(migration.content)
                        await runMigrations(c.env.DB, statements)
                        console.log(`[DEV] Applied migration: ${migration.file}`)
                    }

                    // Re-validate after migrations
                    validation = await validateDB(db)
                }
            } catch (err) {
                console.error(`[DEV] Auto-migration failed: ${err instanceof Error ? err.message : String(err)}`)
            }
        }

        if (!validation.success) {
            return c.json(
                { error: `Database validation failed: ${validation.error}` },
                503
            )
        }

        // 4. Set db in context and proceed
        c.set('db', db)
        await next()
    }
}
