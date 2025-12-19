import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { formatTestFile, sleep } from './utils';

const fixturesPath = path.resolve(__dirname, '../../../test-fixtures');

suite('Extension Test Suite', function () {
    this.timeout(60000);

    const testFile = 'eslint/test.js';
    const originalConfig: Record<string, unknown> = {};

    suiteSetup(async () => {
        const ext = vscode.extensions.getExtension('takline.prettier-eslint-modern');
        await ext?.activate();
    });

    setup(async () => {
        const config = vscode.workspace.getConfiguration('prettier-eslint-modern');
        originalConfig['prettierLast'] = config.get('prettierLast');
        await config.update('prettierLast', false, vscode.ConfigurationTarget.Global);
    });

    teardown(async () => {
        const config = vscode.workspace.getConfiguration('prettier-eslint-modern');
        await config.update('prettierLast', originalConfig['prettierLast'], vscode.ConfigurationTarget.Global);
    });

    test('Formats document using eslint.config.mjs (ESLint wins -> Single Quotes)', async () => {
        const { result } = await formatTestFile(testFile, vscode.Uri.file(fixturesPath));
        assert.ok(result.includes("'hello, world'"), 'Should use single quotes');
        assert.ok(!result.includes('"hello, world"'), 'Should not use double quotes');
    });

    test('setting "prettierLast" makes prettier run last (Prettier wins -> Double Quotes)', async () => {
        const config = vscode.workspace.getConfiguration('prettier-eslint-modern');
        await config.update('prettierLast', true, vscode.ConfigurationTarget.Global);
        
        await sleep(500);

        const { result } = await formatTestFile(testFile, vscode.Uri.file(fixturesPath));

        assert.ok(result.includes('"hello, world"'), 'Should use double quotes when prettierLast is true');
        assert.ok(!result.includes("'hello, world'"), 'Should not use single quotes when prettierLast is true');
    });
});
