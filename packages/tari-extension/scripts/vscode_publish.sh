#!/bin/bash
set -e

# Save the workspace root directory
WORKSPACE_ROOT=$(pwd)

TEMP_DIR=$(mktemp -d)

pnpm run build
pnpm pack --pack-destination "$TEMP_DIR"

cd "$TEMP_DIR"
TARBALL=$(ls *.tgz)
tar -xzf "$TARBALL"

cd package

# Remove devDependencies from package.json
jq 'del(.devDependencies)' package.json > package.tmp.json && mv package.tmp.json package.json

npm install --production --omit=dev
PUBLISH_OUTPUT=$(npx -y @vscode/vsce publish -p $VSCE_PAT 2>&1) || true
if echo "$PUBLISH_OUTPUT" | grep -q "already exists"; then
  echo "Extension with this version already exists. Skipping publish."
else
  if echo "$PUBLISH_OUTPUT" | grep -q "Published"; then
    echo "$PUBLISH_OUTPUT"
  else
    echo "$PUBLISH_OUTPUT"
    echo "Publish failed."
    exit 1
  fi
fi

cd "$WORKSPACE_ROOT"
rm -rf "$TEMP_DIR"

echo "VS Code extension published successfully!"
