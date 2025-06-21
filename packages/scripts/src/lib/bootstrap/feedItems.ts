import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeRssFeed} from '@shared/lib/feeds.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {FeedItem} from '@shared/types/feedItems.types';
import type {Feed} from '@shared/types/feeds.types';
import type {AccountId} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';

interface CreateFeedItemArgs {
  readonly origin: Feed;
  readonly url: string;
  readonly title: string;
  readonly description: string | null;
  readonly outgoingLinks: string[];
  readonly summary: string | null;
}

const personalBlogGatsbyArticleFeedItem: CreateFeedItemArgs = {
  origin: makeRssFeed({subscription: PERSONAL_BLOG_RSS_FEED_SUBSCRIPTION_ID}),
  url: 'https://jwn.gr/posts/migrating-from-gatsby-to-astro/',
  title: 'From Gatsby gridlock to Astro bliss: my personal site redesign',
  description: 'TODO',
  outgoingLinks: [],
  summary: 'TODO',
};

interface CreateSampleFeedItemsResult {
  readonly count: number;
  readonly feedItems: readonly FeedItem[];
}

export async function createSampleFeedItems(args: {
  readonly accountId: AccountId;
  readonly feedItemsService: ServerFeedItemsService;
}): AsyncResult<CreateSampleFeedItemsResult, Error> {
  const {accountId, feedItemsService} = args;

  const feedItems: FeedItem[] = [];

  // Create sample RSS feed items.
  const rssFeedItems = [
    {
      title: 'From Gatsby gridlock to Astro bliss: my personal site redesign',
      url: 'https://jwn.gr/posts/migrating-from-gatsby-to-astro/',
      description: 'TODO',
      summary: 'TODO',
    },
    {
      title: 'Shaping tools that shape us at Notion',
      url: 'https://www.notion.so/blog/shaping-tools-that-shape-us',
      description: 'TODO',
      summary: 'TODO',
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
      origin: makeRssFeed({subscription: PERSON}),
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
