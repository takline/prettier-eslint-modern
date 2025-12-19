import * as assert from "assert";
import { workspace } from "vscode";
import { formatTestFile, readTestFile } from "./utils";

suite("ESLint Integration", function() {
    this.timeout(60000);
	test("it formats with prettier-eslint", async () => {
        if (!workspace.workspaceFolders) {
            throw new Error("No workspace folders found");
        }
        const workspaceFolder = workspace.workspaceFolders[2].uri;
		const { result: actualResult } = await formatTestFile(
			"actual.js",
			workspaceFolder
		);
		const expectedResult = await readTestFile("expected.js", workspaceFolder);
		assert.strictEqual(actualResult, expectedResult);
	});
});
