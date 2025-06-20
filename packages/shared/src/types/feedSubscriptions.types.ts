import type {AccountId} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import type {FeedType, FeedTypeWithSubscription} from '@shared/types/feedSourceTypes.types';
import type {BaseStoreItem} from '@shared/types/utils.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

/**
 * Strongly-typed type for a {@link FeedSubscription}'s unique identifier. Prefer this over
 * plain strings.
 */
export type FeedSubscriptionId = string & {readonly __brand: 'FeedSubscriptionIdBrand'};

/**
 * An individual account's subscription to a feed source.
 *
 * A single URL can have multiple {@link FeedSubscription}s, one for each {@link Account}
 * subscribed to it.
 *
 * Feed subscriptions are not deleted when an account unsubscribes from a feed. Instead, they are
 * marked as inactive. They are only deleted when an account is wiped out.
 */
interface BaseFeedSubscription extends BaseStoreItem {
  /** The unique identifier for this subscription. */
  readonly feedSubscriptionId: FeedSubscriptionId;
  /** The type of feed source this subscription is for. */
  readonly feedType: FeedTypeWithSubscription;
  /** The account that owns this subscription. */
  readonly accountId: AccountId;
  /** Whether this subscription is active. Inactive subscriptions do not generate new feed items. */
  readonly isActive: boolean;
  /** The delivery schedule for this subscription. */
  readonly deliverySchedule: DeliverySchedule;
  /** The time this subscription was unsubscribed from the feed source. */
  readonly unsubscribedTime?: Date | undefined;
}

export interface RssFeedSubscription extends BaseFeedSubscription {
  readonly feedType: FeedType.RSS;
  readonly url: string;
  readonly title: string;
}

export interface YouTubeChannelFeedSubscription extends BaseFeedSubscription {
  readonly feedType: FeedType.YouTubeChannel;
  readonly channelId: YouTubeChannelId;
}

export interface IntervalFeedSubscription extends BaseFeedSubscription {
  readonly feedType: FeedType.Interval;
  readonly intervalSeconds: number;
}

export type FeedSubscription =
  | RssFeedSubscription
  | YouTubeChannelFeedSubscription
  | IntervalFeedSubscription;
