npm version "$1" --no-git-tag-version
bun run package
bun run vsce publish --pre-release -p "$VSCE_PAT"
bun run ovsx publish --pre-release -p "$OVSX_PAT"