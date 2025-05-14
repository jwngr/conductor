import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';
import {RssFeedProviderTypeSchema} from '@shared/types/rss.types';
import type {RssFeedProviderType} from '@shared/types/rss.types';

/**
 * Parses a {@link RssFeedProviderType} from a string. Returns an `ErrorResult` if the string is not
 * a valid {@link RssFeedProviderType}.
 */
export function parseRssFeedProviderType(value: string): Result<RssFeedProviderType> {
  const parsedResult = parseZodResult(RssFeedProviderTypeSchema, value);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid RSS feed provider type');
  }
  return makeSuccessResult(parsedResult.value as RssFeedProviderType);
}
