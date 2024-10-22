import {FieldValue} from 'firebase/firestore';

export type FeedSubscriptionId = string;

export function isFeedSubscriptionId(
  feedSubscriptionId: string | undefined
): feedSubscriptionId is FeedSubscriptionId {
  return typeof feedSubscriptionId === 'string' && feedSubscriptionId.length > 0;
}

export interface FeedSubscription {
  readonly subscriptionId: FeedSubscriptionId;
  readonly url: string;
  readonly createdTime: FieldValue;
  readonly lastUpdatedTime: FieldValue;
}
