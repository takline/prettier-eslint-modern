# Changelog

## v1.0.0 (2025-12-19)

### 🚀 Major Rewrite & Modernization

This release marks a significant overhaul of the extension, forking from the original `vs-code-prettier-eslint` to support modern tooling and improve stability.

#### ✨ New Features
- **Worker Thread Architecture**: Formatting now happens in a background worker thread, ensuring the VS Code UI never freezes, even during heavy operations.
- **ESLint Flat Config Support**: Full support for ESLint v9+ Flat Config (`eslint.config.js` / `eslint.config.mjs`).
- **Prettier v3 Support**: Native support for Prettier v3, including asynchronous plugin resolution.
- **Robust Monorepo Support**: Smarter resolution of plugins and configuration files in complex monorepos (Bun workspaces, PNPM, etc.).
- **Diagnostic Logging**: Enhanced logging in the Output Channel to help troubleshoot configuration issues.

#### 🛠 Improvements
- **Async Ignore Handling**: `.eslintignore` and `.prettierignore` checks are now asynchronous and non-blocking.
- **Dependency Isolation**: The worker bundles its own core dependencies while dynamically loading yours, preventing version conflicts.
- **VSIX Optimization**: Reduced package size by excluding unnecessary files.

#### ⚠️ Breaking Changes
- **Name Change**: Extension is now published as `prettier-eslint-modern` (`takline.prettier-eslint-modern`).