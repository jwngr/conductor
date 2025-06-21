import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {makeCompletedFeedItemImportState} from '@shared/lib/feedItemImportStates.shared';
import {makeFeedItemId} from '@shared/lib/feedItems.shared';
import {
  ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  makeFeedSubscriptionId,
} from '@shared/lib/feedSubscriptions.shared';

import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import type {FeedItem, IntervalFeedItem} from '@shared/types/feedItems.types';
import {TriageStatus} from '@shared/types/feedItems.types';
import {FeedType} from '@shared/types/feeds.types';
import type {
  FeedSubscription,
  IntervalFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import type {AccountId} from '@shared/types/ids.types';
import {SystemTagId} from '@shared/types/tags.types';

interface MockFeedData {
  readonly feedSubscription: FeedSubscription;
  readonly feedItems: FeedItem[];
}

export const makeIntervalMockFeedData = (args: {readonly accountId: AccountId}): MockFeedData => {
  const {accountId} = args;

  const feedSubscription: IntervalFeedSubscription = {
    accountId,
    feedSubscriptionId: makeFeedSubscriptionId(),
    feedType: FeedType.Interval,
    intervalSeconds: 300,
    lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO: Make these relative to the current time.
    createdTime: new Date('2025-06-20T03:30:11.282Z'),
    lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
  };

  const feedItem1: IntervalFeedItem = {
    accountId,
    feedItemContentType: FeedItemContentType.Interval,
    feedItemId: makeFeedItemId(),
    origin: {
      feedType: FeedType.Interval,
      feedSubscriptionId: feedSubscription.feedSubscriptionId,
    },
    importState: makeCompletedFeedItemImportState({
      // TODO: Make these relative to the current time.
      lastImportRequestedTime: new Date('2025-06-20T03:30:40.578Z'),
      lastSuccessfulImportTime: new Date('2025-06-20T03:30:40.607Z'),
    }),
    content: {
      feedItemContentType: FeedItemContentType.Interval,
      intervalSeconds: 300,
      title: 'Interval feed item for 2025-06-20T03:30:11.282Z',
    },
    triageStatus: TriageStatus.Untriaged,
    tagIds: {
      [SystemTagId.Unread]: true,
    },
    // TODO: Make these relative to the current time.
    createdTime: new Date('2025-06-20T03:30:11.282Z'),
    lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
  };

  const feedItem2: IntervalFeedItem = {
    accountId,
    feedItemContentType: FeedItemContentType.Interval,
    feedItemId: makeFeedItemId(),
    origin: {
      feedType: FeedType.Interval,
      feedSubscriptionId: feedSubscription.feedSubscriptionId,
    },
    importState: makeCompletedFeedItemImportState({
      // TODO: Make these relative to the current time.
      lastImportRequestedTime: new Date('2025-06-20T03:30:40.578Z'),
      lastSuccessfulImportTime: new Date('2025-06-20T03:30:40.607Z'),
    }),
    content: {
      feedItemContentType: FeedItemContentType.Interval,
      intervalSeconds: 300,
      title: 'Interval feed item for 2025-06-20T03:30:11.282Z',
    },
    triageStatus: TriageStatus.Untriaged,
    tagIds: {
      [SystemTagId.Unread]: true,
    },
    // TODO: Make these relative to the current time.
    createdTime: new Date('2025-06-20T03:30:11.282Z'),
    lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
  };

  return {
    feedSubscription,
    feedItems: [feedItem1, feedItem2],
  };
};
