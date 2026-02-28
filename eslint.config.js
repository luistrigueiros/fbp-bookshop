import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // Shared rules for all packages
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_" },
            ],
        },
    },
    {
        // Common ignores
        ignores: [
            "**/dist/**",
            "**/node_modules/**",
            "**/drizzle/**",
            "**/worker-configuration.d.ts",
            "**/.wrangler/**",
            "**/*.d.ts",
        ],
    },
    {
        // Specific override for library-excel-extractor
        files: ["packages/library-excel-extractor/**/*.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    }
);
