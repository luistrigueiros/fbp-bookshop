import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';

// This script should be run from the package directory (e.g., packages/library-data-loader)
const packageDir = process.cwd();
const rootDir = resolve(packageDir, '../../');
const envPath = resolve(rootDir, '.dev.vars');
const templatePath = resolve(packageDir, 'wrangler.toml.template');
const outputPath = resolve(packageDir, 'wrangler.toml');

if (!existsSync(envPath)) {
    console.error(`.dev.vars not found at ${envPath}`);
    process.exit(1);
}

if (!existsSync(templatePath)) {
    console.error(`wrangler.toml.template not found at ${templatePath}`);
    process.exit(1);
}

const envContent = readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
    envContent.split(/\r?\n/)
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
            const index = line.indexOf('=');
            if (index === -1) return [line.trim(), ''];
            return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
        })
);

let template = readFileSync(templatePath, 'utf8');

// Replace ${VAR} with value from .dev.vars
const output = template.replace(/\${(\w+)}/g, (_, key) => env[key] || '');

writeFileSync(outputPath, output);
console.log(`Successfully generated wrangler.toml from template in ${basename(packageDir)} using ${Object.keys(env).length} variables.`);
