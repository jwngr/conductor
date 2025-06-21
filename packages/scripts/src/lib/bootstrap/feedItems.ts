import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeRssFeed} from '@shared/lib/feeds.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import type {
  IntervalFeedSubscription,
  RssFeedSubscription,
  YouTubeChannelFeedSubscription,
} from '@shared/types/feedSubscriptions.types';
import type {AccountId} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';

interface CreateSampleFeedItemsResult {
  readonly count: number;
  readonly feedItems: readonly FeedItem[];
}

export async function createSampleFeedItems(args: {
  readonly accountId: AccountId;
  readonly rssSubscriptions: readonly RssFeedSubscription[];
  readonly youtubeSubscriptions: readonly YouTubeChannelFeedSubscription[];
  readonly intervalSubscriptions: readonly IntervalFeedSubscription[];
  readonly feedItemsService: ServerFeedItemsService;
}): AsyncResult<CreateSampleFeedItemsResult, Error> {
  const {accountId, rssSubscriptions, intervalSubscriptions, feedItemsService} = args;

  const feedItems: FeedItem[] = [];

  // Create sample RSS feed items.
  const rssFeedItems = [
    {
      title: 'The Future of AI: What to Expect in 2024',
      url: 'https://techcrunch.com/2024/01/15/future-of-ai-2024/',
      description:
        'A comprehensive look at the latest developments in artificial intelligence and what we can expect in the coming year.',
      summary:
        'This article explores the major AI trends expected in 2024, including advances in large language models, AI regulation, and practical applications in various industries.',
    },
    {
      title: 'Breaking: Major Tech Merger Announced',
      url: 'https://techcrunch.com/2024/01/14/major-tech-merger/',
      description:
        'Two of the biggest names in technology have announced a historic merger that will reshape the industry.',
      summary:
        'A landmark merger between two tech giants is set to create the largest technology company in history, with implications for competition and innovation.',
    },
    {
      title: 'Startup Raises $100M in Series B Funding',
      url: 'https://techcrunch.com/2024/01/13/startup-funding-100m/',
      description:
        'Innovative startup secures massive funding round to expand its revolutionary platform.',
      summary:
        'A promising startup has successfully raised $100 million in Series B funding, signaling strong investor confidence in its business model and growth potential.',
    },
  ];

  for (const item of rssFeedItems) {
    const saveResult = await feedItemsService.createFeedItemFromUrl({
      origin: makeRssFeed({subscription: rssSubscriptions[0]}),
      accountId,
      url: item.url,
      title: item.title,
      description: item.description,
      outgoingLinks: [],
      summary: item.summary,
    });

    if (!saveResult.success) {
      return prefixErrorResult(saveResult, 'Failed to create RSS feed item');
    }

    feedItems.push(saveResult.value);
  }

  for (const intervalSubscription of intervalSubscriptions) {
    const intervalFeedItemResult = await feedItemsService.createIntervalFeedItem({
      accountId,
      subscription: intervalSubscription,
    });

    if (!intervalFeedItemResult.success) {
      return prefixErrorResult(intervalFeedItemResult, 'Failed to create interval feed item');
    }

    feedItems.push(intervalFeedItemResult.value);
  }

  logger.log('[BOOTSTRAP] Successfully created feed items', {
    accountId,
    count: feedItems.length,
  });

  return makeSuccessResult({
    count: feedItems.length,
    feedItems,
  });
}
