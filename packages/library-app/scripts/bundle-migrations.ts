import fs from 'node:fs';
import path from 'node:path';

const packageDir = process.cwd();
const migrationsDir = path.resolve(packageDir, '../library-data-layer/drizzle');
const outputPath = path.resolve(packageDir, 'src/migrations.ts');

if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
}

const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
const sqlFiles = entries
    .filter(e => e.isFile() && e.name.endsWith('.sql'))
    .map(e => e.name)
    .sort((a, b) => a.localeCompare(b));

const migrations = sqlFiles.map(f => {
    const content = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
    return {
        file: f,
        content: content
    };
});

const output = `// Auto-generated file. Do not edit manually.
export const migrations = ${JSON.stringify(migrations, null, 2)};
`;

fs.writeFileSync(outputPath, output);
console.log(`Successfully bundled ${migrations.length} migrations into src/migrations.ts`);
