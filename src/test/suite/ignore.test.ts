import * as assert from "assert";
import { workspace } from "vscode";
import { formatTestFile } from "./utils";

suite("Ignore", function() {
    this.timeout(60000);
	test("it does not format file", async () => {
        if (!workspace.workspaceFolders) {
            throw new Error("No workspace folders found");
        }
        const workspaceFolder = workspace.workspaceFolders[0].uri;
		const { result, source } = await formatTestFile(
			"file-to-ignore.js",
			workspaceFolder
		);
		assert.strictEqual(result, source);
	});

	test("it does not format subfolder/*", async () => {
        if (!workspace.workspaceFolders) {
            throw new Error("No workspace folders found");
        }
        const workspaceFolder = workspace.workspaceFolders[0].uri;
		const { result, source } = await formatTestFile(
			"ignore-me-2/index.js",
			workspaceFolder
		);
		assert.strictEqual(result, source);
	});

	test("it does not format sub-subfolder", async () => {
        if (!workspace.workspaceFolders) {
            throw new Error("No workspace folders found");
        }
        const workspaceFolder = workspace.workspaceFolders[0].uri;
		const { result, source } = await formatTestFile(
			"ignore-me/subdir/index.js",
			workspaceFolder
		);
		assert.strictEqual(result, source);
	});
});
