#!/bin/sh
set -e

# Build Next.js in standalone mode
npm run build

# Copy public assets and static files into the standalone output
# (Next.js standalone does not copy these automatically)
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

echo "Build complete. Standalone output ready."
