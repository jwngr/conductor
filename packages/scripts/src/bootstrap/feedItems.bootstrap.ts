import type {AccountId} from '@shared/types/accounts.types';
import type {
  ArticleFeedItem,
  FeedItem,
  FeedItemId,
  IntervalFeedItem,
} from '@shared/types/feedItems.types';
import {
  FeedItemContentType,
  FeedItemImportStatus,
  TriageStatus,
} from '@shared/types/feedItems.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import {SystemTagId} from '@shared/types/tags.types';

import {
  INTERVAL_1_USER_FEED_SUBSCRIPTION_ID,
  PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID,
} from '@src/bootstrap/userFeedSubscriptions.bootstrap';

const interval1FeedItem1: Omit<IntervalFeedItem, 'accountId'> = {
  feedItemContentType: FeedItemContentType.Interval,
  feedItemId: '45d40db8-e918-4fd5-a359-2e42b942de36' as FeedItemId,
  feedSource: {
    feedSourceType: FeedSourceType.Interval,
    userFeedSubscriptionId: INTERVAL_1_USER_FEED_SUBSCRIPTION_ID,
  },
  importState: {
    status: FeedItemImportStatus.Completed,
    shouldFetch: false,
    lastImportRequestedTime: new Date('2025-06-20T03:30:40.578Z'),
    lastSuccessfulImportTime: new Date('2025-06-20T03:30:40.607Z'),
  },
  content: {
    feedItemContentType: FeedItemContentType.Interval,
    title: 'Interval feed item for 2025-06-20T03:30:11.282Z',
    intervalSeconds: 300,
  },
  triageStatus: TriageStatus.Untriaged,
  tagIds: {
    [SystemTagId.Unread]: true,
  },
  createdTime: new Date('2025-06-20T03:30:11.282Z'),
  lastUpdatedTime: new Date('2025-06-20T03:30:40.610Z'),
};

const personalBlogRssFeedItem1: Omit<ArticleFeedItem, 'accountId'> = {
  feedItemContentType: FeedItemContentType.Article,
  feedItemId: '35d40db8-e918-4fd5-a359-2e42b942de36' as FeedItemId,
  feedSource: {
    feedSourceType: FeedSourceType.RSS,
    // TODO: Duplicated content.
    url: 'https://feeds.feedburner.com/TechCrunch',
    title: 'TechCrunch',
    userFeedSubscriptionId: PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID,
  },
  importState: {
    status: FeedItemImportStatus.Completed,
    shouldFetch: false,
    lastImportRequestedTime: new Date('2025-06-20T03:30:40.578Z'),
    lastSuccessfulImportTime: new Date('2025-06-20T03:30:40.607Z'),
  },
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
