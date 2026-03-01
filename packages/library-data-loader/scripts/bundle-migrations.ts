import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const MIGRATIONS_DIR = join(process.cwd(), 'drizzle')
const OUTPUT_FILE = join(process.cwd(), 'src/migrations.ts')

if (!existsSync(MIGRATIONS_DIR)) {
    console.error('Migrations directory not found:', MIGRATIONS_DIR)
    process.exit(1)
}

const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

const migrations = files.map(file => {
    const content = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')
    return {
        file,
        content
    }
})

const output = `// Auto-generated file. Do not edit manually.
export const migrations = ${JSON.stringify(migrations, null, 2)};
`

writeFileSync(OUTPUT_FILE, output)
console.log('Successfully bundled migrations to:', OUTPUT_FILE)
