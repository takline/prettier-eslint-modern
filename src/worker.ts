/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRequire } from 'module';
import { dirname } from 'path';
import { pathToFileURL } from 'url';
import { parentPort } from 'worker_threads';

// Static imports so esbuild bundles them
import * as bundledPrettier from 'prettier';
import bundledPrettierEslint from 'prettier-eslint';

if (!parentPort) {
    throw new Error('Worker must be spawned with parentPort');
}

function log(message: string) {
    parentPort?.postMessage({ type: 'log', message });
}

parentPort.on('message', async (message) => {
    const { id, data } = message;
    try {
        const result = await format(data);
        parentPort?.postMessage({ id, result });
    } catch (error: unknown) {
        parentPort?.postMessage({ 
            id, 
            error: {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : 'Error'
            } 
        });
    }
});

/**
 * @param {{
 *   text: string;
 *   prettierEslintPath: string;
 *   filePath: string;
 *   extensionConfig?: {
 *     prettierLast?: boolean;
 *   },
 *   logLevel?: string;
 * }} options
 */
async function format({
    text, prettierEslintPath, filePath, extensionConfig, logLevel
}: any) {
    if (logLevel === 'trace') {
        log(`[Worker] Processing ${filePath}`);
    }

    const req = createRequire(filePath);
    let eslintModule;
    
    // 1. Try to find local ESLint
    try {
        const eslintPath = req.resolve('eslint');
        if (logLevel === 'trace') log(`[Worker] Resolved eslint to '${eslintPath}'`);
        eslintModule = await import(pathToFileURL(eslintPath).toString());
    } catch (e: unknown) {
         if (logLevel === 'trace') log(`[Worker] Local ESLint not found: ${e instanceof Error ? e.message : String(e)}`);
    }

    const useModern = eslintModule && !eslintModule.CLIEngine;

    if (useModern) {
        // Modern ESLint logic (using local eslint)
        if (logLevel === 'trace') log('[Worker] Detected Modern ESLint (v9+)');
        if (logLevel === 'trace') log(`[Worker] ESLint module keys: ${Object.keys(eslintModule || {}).join(', ')}`);
        
        let prettier: any;
        try {
            const prettierPath = req.resolve('prettier');
            // Dynamic import for local prettier
            const importedPrettier = await import(pathToFileURL(prettierPath).toString());
            prettier = importedPrettier.default || importedPrettier;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
             if (logLevel === 'trace') log('[Worker] Using bundled Prettier (fallback)');
             prettier = bundledPrettier;
        }

        // Normalize prettier import (safer check)
        if (typeof prettier.resolveConfig !== 'function' && prettier.default && typeof prettier.default.resolveConfig === 'function') {
            prettier = prettier.default;
        }

        if (typeof prettier.resolveConfig !== 'function') {
             const keys = Object.keys(prettier || {});
             log(`[Worker] Prettier object structure: ${keys.join(', ')}`);
             if (prettier && prettier.default) {
                 log(`[Worker] Prettier.default keys: ${Object.keys(prettier.default).join(', ')}`);
             }
             throw new Error(`Prettier.resolveConfig is not a function. Keys: ${keys.join(', ')}`);
        }

        const { loadESLint, ESLint } = eslintModule;
        
        let ESLintClass = ESLint;
        if (loadESLint) {
             try {
                ESLintClass = await loadESLint({ useFlatConfig: true });
                if (logLevel === 'trace') log('[Worker] Loaded ESLint class via loadESLint({ useFlatConfig: true })');
             } catch(e: any) {
                if (logLevel === 'trace') log(`[Worker] loadESLint failed: ${e.message}`);
             }
        }
        
        // Use file directory as CWD to ensure config lookup starts from the right place
        const fileDir = dirname(filePath);
        if (logLevel === 'trace') log(`[Worker] Initializing ESLint with cwd: ${fileDir}`);

        const eslint = new ESLintClass({ fix: true, cwd: fileDir }); 

        let currentText = text;
        const prettierLast = extensionConfig?.prettierLast;

        const prettierInfo = await prettier.resolveConfig(filePath);

        if (prettierInfo && Array.isArray(prettierInfo.plugins)) {
             if (logLevel === 'trace') log(`[Worker] Prettier plugins found: ${prettierInfo.plugins.join(', ')}`);
             
             let configFile: string | null = null;
             try {
                 configFile = await prettier.resolveConfigFile(filePath);
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
             } catch (e) { /* ignore */ }

             prettierInfo.plugins = prettierInfo.plugins.map((plugin: string | any) => {
                 if (typeof plugin === 'string') {
                     try {
                         const resolvedPath = req.resolve(plugin);
                         if (logLevel === 'trace') log(`[Worker] Resolved plugin '${plugin}' to '${resolvedPath}'`);
                         return resolvedPath;
                     } catch (e: any) {
                         // Try resolving relative to config file
                         if (configFile) {
                             try {
                                 const configReq = createRequire(configFile);
                                 const resolvedPath = configReq.resolve(plugin);
                                 if (logLevel === 'trace') log(`[Worker] Resolved plugin '${plugin}' relative to config to '${resolvedPath}'`);
                                 return resolvedPath;
                             } catch (e2: any) {
                                  if (logLevel === 'trace') log(`[Worker] Failed to resolve plugin '${plugin}' relative to config: ${e2.message}`);
                             }
                         }

                         if (logLevel === 'trace') log(`[Worker] Failed to resolve plugin '${plugin}': ${e.message}`);
                         return plugin; // Fallback to original string
                     }
                 }
                 return plugin;
             });
        }

        const prettierOptions = { ...prettierInfo, filepath: filePath };

        if (!prettierLast) {
             currentText = await prettier.format(currentText, prettierOptions);
        }

        const results = await eslint.lintText(currentText, { filePath });
        const result = results[0];
        if (result && result.output) {
            currentText = result.output;
        }

        if (prettierLast) {
            currentText = await prettier.format(currentText, prettierOptions);
        }

        return currentText;

    } else {
        // Legacy logic (prettier-eslint)
        if (logLevel === 'trace') log('[Worker] Legacy mode (prettier-eslint)');
        
        let formatter: any = bundledPrettierEslint;
        
        // Try to load user's prettier-eslint if available
        try {
            if (prettierEslintPath) {
                 const imported = await import(pathToFileURL(prettierEslintPath).toString());
                 formatter = imported.default || imported;
            }
        } catch (e: any) {
            if (logLevel === 'trace') log(`[Worker] Failed to load local prettier-eslint: ${e.message}`);
        }

         // Normalize formatter import
         if (formatter.default) {
            formatter = formatter.default;
        }

        return formatter({
          text,
          filePath,
          logLevel: logLevel || 'info',
          prettierLast: extensionConfig?.prettierLast,
        });
    }
}