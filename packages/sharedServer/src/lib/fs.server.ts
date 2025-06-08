import {readFile as fsReadFile, writeFile as fsWriteFile} from 'fs/promises';

import {asyncTry, syncTry} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';

const DEFAULT_ENCODING: BufferEncoding = 'utf-8';

/**
 * Helper function wrapping `fs.readFile` in a result.
 */
export async function readFile(
  filePath: string,
  encoding: BufferEncoding = DEFAULT_ENCODING
): AsyncResult<string, Error> {
  return await asyncTry(async () => fsReadFile(filePath, encoding));
}

/**
 * Helper function wrapping `fs.writeFile` in a result.
 */
export async function writeFile(filePath: string, data: string): AsyncResult<void, Error> {
  return await asyncTry(async () => fsWriteFile(filePath, data));
}

/**
 * Helper function to write JSON data to a file.
 */
export async function writeJsonFile(
  filePath: string,
  data: unknown,
  options: {pretty?: boolean} = {pretty: true}
): AsyncResult<void, Error> {
  const pretty = options.pretty ?? true;
  const jsonStringResult = syncTry(() => JSON.stringify(data, null, pretty ? 2 : undefined));
  if (!jsonStringResult.success) return jsonStringResult;

  const writeFileResult = await writeFile(filePath, jsonStringResult.value);
  if (!writeFileResult.success) return writeFileResult;

  return makeSuccessResult(undefined);
}
