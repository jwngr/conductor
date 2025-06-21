import {makeIntervalFeedItemContent} from '@shared/lib/feedItemContent.shared';
import {makeCompletedFeedItemImportState} from '@shared/lib/feedItemImportStates.shared';
import {makeFeedItemId} from '@shared/lib/feedItems.shared';

import {FeedItemContentType} from '@shared/types/feedItemContent.types';
import type {ArticleFeedItem, FeedItem, IntervalFeedItem} from '@shared/types/feedItems.types';
import {TriageStatus} from '@shared/types/feedItems.types';
import {FeedType} from '@shared/types/feeds.types';
import {SystemTagId} from '@shared/types/tags.types';

import {
  INTERVAL_1_USER_FEED_SUBSCRIPTION_ID,
  PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID,
} from '@src/bootstrap/feedSubscriptions.bootstrap';

const INTERVAL_1_FEED_ITEM_1_ID = makeFeedItemId();
const PERSONAL_BLOG_RSS_FEED_ITEM_1_ID = makeFeedItemId();

const interval1FeedItem1: Omit<IntervalFeedItem, 'accountId'> = {
  feedItemContentType: FeedItemContentType.Interval,
  feedItemId: INTERVAL_1_FEED_ITEM_1_ID,
  origin: {
    feedType: FeedType.Interval,
    feedSubscriptionId: INTERVAL_1_USER_FEED_SUBSCRIPTION_ID,
  },
  importState: makeCompletedFeedItemImportState({
    lastImportRequestedTime: new Date('2025-06-20T03:30:40.578Z'),
    lastSuccessfulImportTime: new Date('2025-06-20T03:30:40.607Z'),
  }),
  content: makeIntervalFeedItemContent({
    intervalSeconds: 300,
    title: 'Interval feed item for 2025-06-20T03:30:11.282Z',
  }),
  triageStatus: TriageStatus.Untriaged,
  tagIds: {
    [SystemTagId.Unread]: true,
  },
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

const personalBlogRssFeedItem1: Omit<ArticleFeedItem, 'accountId'> = {
  feedItemContentType: FeedItemContentType.Article,
  feedItemId: PERSONAL_BLOG_RSS_FEED_ITEM_1_ID,
  origin: {
    feedType: FeedType.RSS,
    feedSubscriptionId: PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID,
  },
  importState: makeCompletedFeedItemImportState({
    lastImportRequestedTime: new Date('2025-06-20T03:30:40.578Z'),
    lastSuccessfulImportTime: new Date('2025-06-20T03:30:40.607Z'),
  }),
  content: {
    feedItemContentType: FeedItemContentType.Article,
    // Duplicated content.
    title: 'TechCrunch',
    url: 'https://feeds.feedburner.com/TechCrunch',
    description: null,
    outgoingLinks: [],
    summary: null,
  },
  triageStatus: TriageStatus.Untriaged,
  tagIds: {
    [SystemTagId.Unread]: true,
  },
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

export const mockFeedItems: Array<Omit<FeedItem, 'accountId'>> = [
  interval1FeedItem1,
  personalBlogRssFeedItem1,
];
