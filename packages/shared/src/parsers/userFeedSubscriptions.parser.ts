import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {Result} from '@shared/types/results.types';
import type {
  UserFeedSubscription,
  UserFeedSubscriptionId,
} from '@shared/types/userFeedSubscriptions.types';

import {
  UserFeedSubscriptionIdSchema,
  UserFeedSubscriptionSchema,
} from '@shared/schemas/userFeedSubscriptions.schema';
import {fromStorageUserFeedSubscription} from '@shared/storage/userFeedSubscriptions.storage';

/**
 * Attempts to parse a plain string into a {@link UserFeedSubscriptionId}.
 */
export function parseUserFeedSubscriptionId(
  maybeUserFeedSubscriptionId: string
): Result<UserFeedSubscriptionId> {
  const parsedResult = parseZodResult(UserFeedSubscriptionIdSchema, maybeUserFeedSubscriptionId);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription ID');
  }
  return makeSuccessResult(parsedResult.value as UserFeedSubscriptionId);
}

/**
 * Attempts to parse an unknown value into a {@link UserFeedSubscription}.
 */
export function parseUserFeedSubscription(
  maybeUserFeedSubscription: unknown
): Result<UserFeedSubscription> {
  const parsedResult = parseZodResult(UserFeedSubscriptionSchema, maybeUserFeedSubscription);
  if (!parsedResult.success) {
    return prefixErrorResult(parsedResult, 'Invalid user feed subscription');
  }
  const userFeedSubscriptionFromStorage = parsedResult.value;
  return fromStorageUserFeedSubscription(userFeedSubscriptionFromStorage);
}
