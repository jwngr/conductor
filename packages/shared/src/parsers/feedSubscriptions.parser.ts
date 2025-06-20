import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {FeedSubscription, FeedSubscriptionId} from '@shared/types/feedSubscriptions.types';
import type {Result} from '@shared/types/results.types';

import {
  FeedSubscriptionIdSchema,
  FeedSubscriptionSchema,
} from '@shared/schemas/feedSubscriptions.schema';
import {fromStorageFeedSubscription} from '@shared/storage/feedSubscriptions.storage';

/**
 * Attempts to parse a plain string into a {@link FeedSubscriptionId}.
 */
export function parseFeedSubscriptionId(
  maybeFeedSubscriptionId: string
): Result<FeedSubscriptionId, Error> {
  const parsedResult = parseZodResult(FeedSubscriptionIdSchema, maybeFeedSubscriptionId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid feed subscription ID');
  }
  return makeSuccessResult(parsedResult.value as FeedSubscriptionId);
}

/**
 * Attempts to parse an unknown value into a {@link FeedSubscription}.
 */
export function parseFeedSubscription(
  maybeFeedSubscription: unknown
): Result<FeedSubscription, Error> {
  const parsedResult = parseZodResult(FeedSubscriptionSchema, maybeFeedSubscription);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid feed subscription');
  }
  const feedSubscriptionFromStorage = parsedResult.value;
  return fromStorageFeedSubscription(feedSubscriptionFromStorage);
}
