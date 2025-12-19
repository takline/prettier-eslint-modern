import requireRelative from 'require-relative';
import * as vscode from 'vscode';

/**
 * Resolves the path of a module relative to a file path.
 */
export function getModulePath(filePath: string, moduleName: string): string {
    try {
        return requireRelative.resolve(moduleName, filePath);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        try {
            return require.resolve(moduleName);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch(e) {
            return '';
        }
    }
}

/**
 * Gets the configuration for the extension
 */
export function getConfig() {
    return vscode.workspace.getConfiguration('prettier-eslint-modern');
}
