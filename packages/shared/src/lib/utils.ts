export const formatWithCommas = (val: number): string => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function assertNever(x: never): never {
  // TODO: Add logging. Or a global error handler.
  throw new Error(`Unexpected object: ${x}`);
}

export function filterNull<T>(arr: (T | null)[]): T[] {
  return arr.filter(Boolean) as T[];
}

export function filterUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter(Boolean) as T[];
}

export function mapNull<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export function mapUndefined<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

/**
 * Runs all of the provided async tasks in batches of a given size. If the number of tasks is less
 * than the batch size, all tasks are run in parallel.
 */
export async function batchPromises<T>(tasks: Promise<T>[], batchSize: number): Promise<T[]> {
  if (batchSize <= 0) {
    throw new Error(`Invalid batch size: ${batchSize}`);
  }

  const allBatches: Promise<T>[][] = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    allBatches.push(tasks.slice(i, i + batchSize));
  }

  const allResults: T[] = [];
  for (const currentBatch of allBatches) {
    const currentBatchResults = await Promise.all(currentBatch);
    allResults.push(...currentBatchResults);
  }
  return allResults;
}
