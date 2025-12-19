<img src="https://github.com/takline/prettier-eslint-modern/blob/master/icon.png?raw=true" width="150">

# Prettier ESLint Modern (VS Code Extension)

> A fork of [vs-code-prettier-eslint](https://github.com/idahogurl/vs-code-prettier-eslint) focused on compatibility with newer toolchains and improved reliability.

- [Why this fork?](#why-this-fork)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Why this fork?

This extension builds upon the excellent foundation of `vs-code-prettier-eslint` to support the latest standards in the JavaScript ecosystem. It is designed to work seamlessly with newer versions of ESLint and Prettier while ensuring a stable, error-free experience.

- **Compatibility**: Full support for **ESLint Flat Config (`eslint.config.js`)** and **Prettier v3**.
- **Reliability**: Runs formatting in a background worker thread to prevent UI freezing. Includes specific fixes for "resolveConfig" errors and package resolution issues often encountered in complex Monorepos.
- **Robustness**: Improved logic for finding plugins and configurations relative to your workspace files.

## Features

- Formats JavaScript, TypeScript, Vue, Svelte, and more using `prettier-eslint`.
- **Non-blocking**: Formatting runs in a background worker.
- **Flat Config Ready**: Works seamlessly with ESLint v9+ Flat Config.
- **Monorepo Friendly**: Smart resolution of plugins and configs relative to your files.

## Installation

[Download the extension](https://marketplace.visualstudio.com/items?itemName=takline.prettier-eslint-modern) from the VS Code Marketplace.

## Configuration

This extension uses your existing project configuration.

1.  **Install Dependencies**: Ensure `prettier`, `eslint`, and `prettier-eslint` are installed in your project.

    ```bash
    npm install --save-dev prettier eslint prettier-eslint
    ```

2.  **VS Code Settings**:
    Open your `.vscode/settings.json` and set this extension as the default formatter:

    ```json
    {
      "editor.defaultFormatter": "takline.prettier-eslint-modern",
      "editor.formatOnSave": true
    }
    ```

3.  **Extension Settings**:
    You can configure specific behaviors in VS Code settings:

    - `prettier-eslint-modern.prettierLast`: Run Prettier *after* ESLint (defaults to `false`).

## Troubleshooting

If formatting fails:

1.  Open the **Output** panel in VS Code (`View` -> `Output`).
2.  Select **Prettier ESLint Formatter** from the dropdown.
3.  Review the logs. This extension provides detailed tracing (enabled by default in this version for diagnostics) to help you understand what config or plugin failed to load.

### Common Issues

- **"Could not find config file"**: Ensure you have an `eslint.config.js` (Flat Config) or `.eslintrc` (Legacy) in your project root. The extension attempts to find the config relative to the file being formatted.
- **"Cannot find package 'prettier-plugin-xxx'"**: This usually means the plugin is installed in a way that Prettier v3's internal resolution can't find (common in some monorepos). This extension attempts to patch this, but ensuring the plugin is a direct dependency of your project often helps.

---

**Acknowledgement**: This project is based on the hard work of [Rebecca Vest](https://github.com/idahogurl) and the contributors of the original `vs-code-prettier-eslint`.
