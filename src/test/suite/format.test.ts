import * as assert from "assert";
import * as prettier from "prettier";
import { workspace } from "vscode";
import { formatTestFile } from "./utils";

async function formatSameAsPrettier(filepath: string) {
    if (!workspace.workspaceFolders) {
        throw new Error("No workspace folders found");
    }
	const { result, source } = await formatTestFile(
		filepath,
		workspace.workspaceFolders[0].uri
	);
    const options = await prettier.resolveConfig(workspace.workspaceFolders[0].uri.fsPath + "/" + filepath);
	const prettierFormatted = await prettier.format(source, { filepath, ...options });
	assert.strictEqual(result, prettierFormatted);
}

suite("Prettier Formats", function() {
    this.timeout(60000);
	test("it formats JavaScript", async () => {
		await formatSameAsPrettier("format-test/ugly.js");
	});
	test("it formats TypeScript", async () => {
		await formatSameAsPrettier("format-test/ugly.ts");
	});
	test("it formats CSS", async () => {
		await formatSameAsPrettier("format-test/ugly.css");
	});
	test("it formats JSON", async () => {
		await formatSameAsPrettier("format-test/ugly.json");
	});
	test("it formats package.json", async () => {
		await formatSameAsPrettier("format-test/package.json");
	});
	test("it formats HTML", async () => {
		await formatSameAsPrettier("format-test/index.html");
	});
});