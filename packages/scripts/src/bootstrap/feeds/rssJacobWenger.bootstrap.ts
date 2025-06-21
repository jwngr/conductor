import {IMMEDIATE_DELIVERY_SCHEDULE} from '@shared/lib/deliverySchedules.shared';
import {makeCompletedFeedItemImportState} from '@shared/lib/feedItemImportStates.shared';
import {makeFeedItemId} from '@shared/lib/feedItems.shared';
import {
  ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
  makeFeedSubscriptionId,
} from '@shared/lib/feedSubscriptions.shared';

import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import type {ArticleFeedItem, FeedItem} from '@shared/types/feedItems.types';
import {TriageStatus} from '@shared/types/feedItems.types';
import {FeedType} from '@shared/types/feeds.types';
import type {FeedSubscription, RssFeedSubscription} from '@shared/types/feedSubscriptions.types';
import type {AccountId} from '@shared/types/ids.types';
import {SystemTagId} from '@shared/types/tags.types';

interface MockFeedData {
  readonly feedSubscription: FeedSubscription;
  readonly feedItems: FeedItem[];
}

export const makeRssJacobWengerMockFeedData = (args: {
  readonly accountId: AccountId;
}): MockFeedData => {
  const {accountId} = args;

  const feedSubscription: RssFeedSubscription = {
    accountId,
    feedSubscriptionId: makeFeedSubscriptionId(),
    feedType: FeedType.RSS,
    url: 'https://jwn.gr/feed.xml',
    title: 'Jacob Wenger',
    lifecycleState: ACTIVE_FEED_SUBSCRIPTION_LIFECYCLE_STATE,
    deliverySchedule: IMMEDIATE_DELIVERY_SCHEDULE,
    // TODO: Make these relative to the current time.
    createdTime: new Date('2025-06-20T03:30:11.282Z'),
    lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
  };

  const feedItem1: ArticleFeedItem = {
    accountId,
    feedItemContentType: FeedItemContentType.Article,
    feedItemId: makeFeedItemId(),
    origin: {
      feedType: FeedType.RSS,
      feedSubscriptionId: feedSubscription.feedSubscriptionId,
    },
    importState: makeCompletedFeedItemImportState({
      // TODO: Make these relative to the current time.
      lastImportRequestedTime: new Date('2025-06-20T03:30:40.578Z'),
      lastSuccessfulImportTime: new Date('2025-06-20T03:30:40.607Z'),
    }),
    content: {
      feedItemContentType: FeedItemContentType.Article,
      title: 'From Gatsby gridlock to Astro bliss: my personal site redesign',
      url: 'https://jwn.gr/posts/migrating-from-gatsby-to-astro/',
      // TODO: Fill in this content.
      description: null,
      summary: null,
    },
    triageStatus: TriageStatus.Untriaged,
    tagIds: {
      [SystemTagId.Unread]: true,
    },
    // TODO: Make these relative to the current time.
    createdTime: new Date('2025-06-20T03:30:11.282Z'),
    lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
  };

  const feedItem2: ArticleFeedItem = {
    accountId,
    feedItemContentType: FeedItemContentType.Article,
    feedItemId: makeFeedItemId(),
    origin: {
      feedType: FeedType.RSS,
      feedSubscriptionId: feedSubscription.feedSubscriptionId,
    },
    importState: makeCompletedFeedItemImportState({
      // TODO: Make these relative to the current time.
      lastImportRequestedTime: new Date('2025-06-20T03:30:40.578Z'),
      lastSuccessfulImportTime: new Date('2025-06-20T03:30:40.607Z'),
    }),
    content: {
      feedItemContentType: FeedItemContentType.Article,
      title: 'Shaping tools that shape us at Notion',
      url: 'https://jwn.gr/posts/joining-notion/',
      // TODO: Fill in this content.
      description: null,
      summary: null,
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
