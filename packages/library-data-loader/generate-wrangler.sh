#!/bin/bash

# Load environment variables if the file exists
ENV_FILE="$HOME/share/.library-project.env"
if [ -f "$ENV_FILE" ]; then
  # Use 'sed' to remove the '%' at the end of the CLOUDFLARE_D1_TOKEN if it was a copy-paste artifact, 
  # or just source it directly.
  # sourcing directly might be problematic if there are special chars.
  # Bun's --env-file is cleaner but we are in bash.
  set -a
  source "$ENV_FILE"
  set +a
fi

if [ -z "$CLOUDFLARE_DATABASE_ID" ]; then
  echo "Error: CLOUDFLARE_DATABASE_ID is not set."
  exit 1
fi

# Generate wrangler.json from template
# Using perl because it handles environment variables in a cleaner way than sed for this purpose
# or just simple sed if we know there are no special chars in the UUID.
sed "s/\${CLOUDFLARE_DATABASE_ID}/$CLOUDFLARE_DATABASE_ID/g" wrangler.json.template > wrangler.json

echo "Generated wrangler.json with database_id=$CLOUDFLARE_DATABASE_ID"
