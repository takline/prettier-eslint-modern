import { findUp } from 'find-up';
import fs from 'fs/promises';
import ignore from 'ignore';
import path from 'path';

const LINE_SEPARATOR_REGEX = /(\r|\n|\r\n)/;

/**
 * Returns a function that checks if a given filename is ignored based on the contents of a file.
 */
async function getIsIgnored(filename: string) {
  try {
    const content = await fs.readFile(filename, 'utf8');
    const ignoreLines = content
        .split(LINE_SEPARATOR_REGEX)
        .filter((line) => Boolean(line.trim()));
    const instance = ignore();
    instance.add(ignoreLines);
    return instance.ignores.bind(instance);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: unknown) {
      return () => false;
  }
}

/**
 * Checks if a file path is matched by the ignore rules defined in a specific ignore file.
 */
export async function isFilePathMatchedByIgnore(filePath: string, workspaceDirectory: string | undefined, ignoreFileName: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = { cwd: path.dirname(filePath) };
  if (workspaceDirectory) {
    options.stopAt = workspaceDirectory;
  }
  
  const ignorePath = await findUp(ignoreFileName, options);
  if (!ignorePath) {
    return false;
  }

  const ignoreDir = path.dirname(ignorePath);
  const filePathRelativeToIgnoreDir = path.relative(ignoreDir, filePath);
  const isIgnored = await getIsIgnored(ignorePath);
  return isIgnored(filePathRelativeToIgnoreDir);
}