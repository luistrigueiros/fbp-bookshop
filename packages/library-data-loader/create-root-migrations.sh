#!/bin/bash
# Generate drizzle migrations in the root based on the schema from library-data-layer

set -e

# Path to library-data-layer
DATA_LAYER_PATH="node_modules/library-data-layer"

# Create root drizzle folder if it doesn't exist
mkdir -p drizzle

if [ ! -d "$DATA_LAYER_PATH" ]; then
  echo "Error: $DATA_LAYER_PATH not found. Please run bun install first."
  exit 1
fi

echo "Generating migrations from $DATA_LAYER_PATH..."

# We use tsx to bypass Bun's type stripping limitation in node_modules
# and we run it from the root but pointing to the config in the node_modules
# however, it's cleaner to run it from node_modules if it has its own config
# but we want the output in the root.

# If we run it here, it uses the root as 'out' if the config says so.
# Let's create a temporary config or just use the one in node_modules and hope it works.

# Create temporary config to generate migrations from the dependency schema
cat <<EOF > drizzle-root.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './node_modules/library-data-layer/src/schema/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
});
EOF

echo "Generating migrations..."
bunx tsx node_modules/drizzle-kit/bin.cjs generate --config drizzle-root.config.ts

# Clean up temp config
rm drizzle-root.config.ts

echo "Migrations generated/updated in ./drizzle folder."
