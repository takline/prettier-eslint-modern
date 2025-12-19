npm version "$1" --no-git-tag-version
bun run package
bun run vsce publish -p "$VSCE_PAT"
bun run ovsx publish -p "$OVSX_PAT"