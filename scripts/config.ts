import fs from 'node:fs';
import path from 'node:path';

// This script should be run from the package directory (e.g., packages/library-data-loader)
const packageDir = process.cwd();
const rootDir = path.resolve(packageDir, '../../');
const envPath = path.resolve(rootDir, '.dev.vars');
const templatePath = path.resolve(packageDir, 'wrangler.toml.template');
const outputPath = path.resolve(packageDir, 'wrangler.toml');

if (!fs.existsSync(envPath)) {
    console.error(`.dev.vars not found at ${envPath}`);
    process.exit(1);
}

if (!fs.existsSync(templatePath)) {
    console.error(`wrangler.toml.template not found at ${templatePath}`);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
    envContent.split(/\r?\n/)
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
            const index = line.indexOf('=');
            if (index === -1) return [line.trim(), ''];
            return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
        })
);

let template = fs.readFileSync(templatePath, 'utf8');

for (const [key, value] of Object.entries(env)) {
    const placeholder = `\${${key}}`;
    template = template.split(placeholder).join(value);
}

fs.writeFileSync(outputPath, template);
console.log(`Successfully generated wrangler.toml from template in ${path.basename(packageDir)} using ${Object.keys(env).length} variables.`);
