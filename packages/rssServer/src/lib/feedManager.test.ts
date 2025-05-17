import {expectErrorResult, expectSuccessResult} from '@shared/lib/testUtils.shared';

import type {RssFeed, RssFeedItem} from '@shared/types/rss.types';

import {InMemoryRssFeedManager} from '@src/lib/feedManager';

const MOCK_FEED: RssFeed = {
  id: 'test-feed-1',
  title: 'Test Feed',
  link: 'https://example.com/feed',
  description: 'A test feed',
  items: [],
};

const MOCK_FEED_ITEM: RssFeedItem = {
  id: 'item-1',
  title: 'Test Item',
  link: 'https://example.com/item-1',
  description: 'A test item',
  pubDate: new Date('2024-01-01'),
};

describe('InMemoryRssFeedManager', () => {
  let feedManager: InMemoryRssFeedManager;

  beforeEach(() => {
    feedManager = new InMemoryRssFeedManager();
  });

  describe('getFeed', () => {
    it('should return null for non-existent feed', () => {
      const result = feedManager.getFeed({feedId: 'non-existent'});
      expect(result).toBeNull();
    });

    it('should return feed when it exists', () => {
      feedManager.addFeed({feed: MOCK_FEED});
      const result = feedManager.getFeed({feedId: MOCK_FEED.id});
      expect(result).toEqual(MOCK_FEED);
    });
  });

  describe('addFeed', () => {
    it('should successfully add a feed', () => {
      const result = feedManager.addFeed({feed: MOCK_FEED});
      expectSuccessResult(result, undefined);
      expect(feedManager.getFeed({feedId: MOCK_FEED.id})).toEqual(MOCK_FEED);
    });
  });

  describe('updateFeed', () => {
    it('should return error for non-existent feed', async () => {
      const result = await feedManager.updateFeed({
        feedId: 'non-existent',
        items: [MOCK_FEED_ITEM],
      });
      expectErrorResult(result, 'Feed non-existent not found');
    });

    it('should successfully update feed with new items', async () => {
      feedManager.addFeed({feed: MOCK_FEED});
      const result = await feedManager.updateFeed({
        feedId: MOCK_FEED.id,
        items: [MOCK_FEED_ITEM],
      });
      expectSuccessResult(result, undefined);
      const updatedFeed = feedManager.getFeed({feedId: MOCK_FEED.id});
      expect(updatedFeed?.items).toEqual([MOCK_FEED_ITEM]);
    });
  });

  describe('subscriptions', () => {
    const callbackUrl = 'https://example.com/callback';

    it('should handle subscriptions correctly', () => {
      feedManager.subscribe({feedUrl: MOCK_FEED.link, callbackUrl});
      const subscriptions = feedManager.getSubscriptions({feedUrl: MOCK_FEED.link});
      expect(subscriptions?.size).toBe(1);
      expect(Array.from(subscriptions ?? [])[0]).toEqual({
        feedUrl: MOCK_FEED.link,
        callbackUrl,
      });
    });

    it('should handle unsubscriptions correctly', () => {
      feedManager.subscribe({feedUrl: MOCK_FEED.link, callbackUrl});
      feedManager.unsubscribe({feedUrl: MOCK_FEED.link});
      const subscriptions = feedManager.getSubscriptions({feedUrl: MOCK_FEED.link});
      expect(subscriptions).toBeNull();
    });
  });
});
