import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {Result} from '@shared/types/results.types';
import type {StoriesSidebarItemId} from '@shared/types/stories.types';

import {StoriesSidebarItemIdSchema} from '@shared/schemas/stories.schema';

/**
 * Attempts to parse a plain string into an {@link StoriesSidebarItemId}.
 */
export function parseStoriesSidebarItemId(
  maybeStoriesSidebarItemId: string
): Result<StoriesSidebarItemId, Error> {
  const parsedResult = parseZodResult(StoriesSidebarItemIdSchema, maybeStoriesSidebarItemId);
  return prefixResultIfError(parsedResult, 'Invalid stories sidebar item ID');
}
