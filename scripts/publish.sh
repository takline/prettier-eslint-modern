#!/bin/bash
set -e

if [ -z "$VSCE_PAT" ]; then
  echo "Error: VSCE_PAT is not set."
  exit 1
fi

if [ -z "$OPEN_VSX_PAT" ]; then
  echo "Error: OPEN_VSX_PAT is not set."
  exit 1
fi

echo "Packaging extension..."
bun run package

echo "Publishing to VS Code Marketplace..."
bun run vsce publish -p "$VSCE_PAT" --no-dependencies

echo "Publishing to Open VSX Registry..."
bun run ovsx publish -p "$OPEN_VSX_PAT" --no-dependencies