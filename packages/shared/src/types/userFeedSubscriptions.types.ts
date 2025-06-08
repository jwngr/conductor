import type {AccountId} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import type {FeedSourceType, PersistedFeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {BaseStoreItem} from '@shared/types/utils.types';
import type {YouTubeChannelId} from '@shared/types/youtube.types';

/**
 * Strongly-typed type for a {@link UserFeedSubscription}'s unique identifier. Prefer this over
 * plain strings.
 */
export type UserFeedSubscriptionId = string & {readonly __brand: 'UserFeedSubscriptionIdBrand'};

/**
 * An individual account's subscription to a feed source.
 *
 * A single URL can have multiple {@link UserFeedSubscription}s, one for each {@link Account}
 * subscribed to it.
 *
 * User feed subscriptions are not deleted when an account unsubscribes from a feed. Instead, they
 * are marked as inactive. They are only deleted when an account is wiped out.
 */
interface BaseUserFeedSubscription extends BaseStoreItem {
  /** The unique identifier for this subscription. */
  readonly userFeedSubscriptionId: UserFeedSubscriptionId;
  /** The type of feed source this subscription is for. */
  readonly feedSourceType: PersistedFeedSourceType;
  /** The account that owns this subscription. */
  readonly accountId: AccountId;
  /** Whether this subscription is active. Inactive subscriptions do not generate new feed items. */
  readonly isActive: boolean;
  /** The delivery schedule for this subscription. */
  readonly deliverySchedule: DeliverySchedule;
  /** The time this subscription was unsubscribed from the feed source. */
  readonly unsubscribedTime?: Date | undefined;
}

export interface RssUserFeedSubscription extends BaseUserFeedSubscription {
  readonly feedSourceType: FeedSourceType.RSS;
  readonly url: string;
  readonly title: string;
}

export interface YouTubeChannelUserFeedSubscription extends BaseUserFeedSubscription {
  readonly feedSourceType: FeedSourceType.YouTubeChannel;
  readonly channelId: YouTubeChannelId;
}

export interface IntervalUserFeedSubscription extends BaseUserFeedSubscription {
  readonly feedSourceType: FeedSourceType.Interval;
  readonly intervalSeconds: number;
}

export type UserFeedSubscription =
  | RssUserFeedSubscription
  | YouTubeChannelUserFeedSubscription
  | IntervalUserFeedSubscription;
