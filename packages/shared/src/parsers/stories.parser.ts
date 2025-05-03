import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';
import type {StoriesSidebarItemId} from '@shared/types/stories.types';
import {StoriesSidebarItemIdSchema} from '@shared/types/stories.types';

/**
 * Parses a {@link StoriesSidebarItemId} from a plain string. Returns an `ErrorResult` if the string is not
 * valid.
 */
export function parseStoriesSidebarItemId(
  maybeStoriesSidebarItemId: string
): Result<StoriesSidebarItemId> {
  const parsedResult = parseZodResult(StoriesSidebarItemIdSchema, maybeStoriesSidebarItemId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid stories sidebar item ID');
  }
  return makeSuccessResult(parsedResult.value as StoriesSidebarItemId);
}
