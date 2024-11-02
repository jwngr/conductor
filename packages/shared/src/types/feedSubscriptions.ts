import {FieldValue} from 'firebase/firestore';

import {UserId} from '@shared/types/user';

export type FeedSubscriptionId = string;

export function isFeedSubscriptionId(
  feedSubscriptionId: FeedSubscriptionId | undefined
): feedSubscriptionId is FeedSubscriptionId {
  return typeof feedSubscriptionId === 'string' && feedSubscriptionId.length > 0;
}

export interface FeedSubscription {
  readonly subscriptionId: FeedSubscriptionId;
  readonly url: string;
  readonly userId: UserId;
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}
