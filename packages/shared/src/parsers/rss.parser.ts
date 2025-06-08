import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {Result} from '@shared/types/results.types';
import type {RssFeedProviderType} from '@shared/types/rss.types';

import {RssFeedProviderTypeSchema} from '@shared/schemas/rss.schema';

/**
 * Attempts to parse a plain string into an {@link RssFeedProviderType}.
 */
export function parseRssFeedProviderType(
  maybeRssFeedProviderType: string
): Result<RssFeedProviderType, Error> {
  const parsedResult = parseZodResult(RssFeedProviderTypeSchema, maybeRssFeedProviderType);
  return prefixResultIfError(parsedResult, 'Invalid RSS feed provider type');
}
