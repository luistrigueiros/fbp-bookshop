const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../.dev.vars');
const templatePath = path.resolve(__dirname, '../wrangler.toml.template');
const outputPath = path.resolve(__dirname, '../wrangler.toml');

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
console.log(`Successfully generated wrangler.toml from template with ${Object.keys(env).length} variables.`);
