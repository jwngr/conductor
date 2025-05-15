import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {requestPost} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult, Result} from '@shared/types/results.types';
import type {
  RssFeed,
  RssFeedItem,
  RssFeedManager,
  RssFeedSubscription,
} from '@shared/types/rss.types';

export class InMemoryRssFeedManager implements RssFeedManager {
  private readonly feeds: Map<string, RssFeed>;
  private readonly subscriptions: Map<string, Set<RssFeedSubscription>>;

  constructor() {
    this.feeds = new Map();
    this.subscriptions = new Map();
  }

  public getFeed(args: {feedId: string}): RssFeed | null {
    const {feedId} = args;
    return this.feeds.get(feedId) ?? null;
  }

  public addFeed(args: {feed: RssFeed}): Result<void> {
    const {feed} = args;
    this.feeds.set(feed.id, feed);
    return makeSuccessResult(undefined);
  }

  public async updateFeed(args: {feedId: string; items: RssFeedItem[]}): AsyncResult<void> {
    const {feedId, items} = args;
    const feed = this.feeds.get(feedId);
    if (!feed) {
      return makeErrorResult(new Error(`Feed ${feedId} not found`));
    }

    const updatedFeed: RssFeed = {
      ...feed,
      items: [...feed.items, ...items],
    };
    this.feeds.set(feedId, updatedFeed);

    // Notify subscribers.
    const feedSubscriptions = this.subscriptions.get(feed.link);
    if (feedSubscriptions) {
      for (const subscription of feedSubscriptions) {
        const postResult = await requestPost(subscription.callbackUrl, {
          status: {
            code: 200,
            http: '200',
            feed: feed.link,
          },
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.description ?? '',
            permalinkUrl: item.link,
            published: item.pubDate.getTime(),
            updated: item.pubDate.getTime(),
          })),
        });
        if (!postResult.success) {
          logger.error(prefixError(postResult.error, 'Error notifying feed subscribers'), {
            error: postResult.error,
            feedId,
            callbackUrl: subscription.callbackUrl,
          });
        }
      }
    }

    return makeSuccessResult(undefined);
  }

  public subscribe(args: {feedUrl: string; callbackUrl: string}): void {
    const {feedUrl, callbackUrl} = args;
    const subscription: RssFeedSubscription = {feedUrl, callbackUrl};
    const feedSubscriptions = this.subscriptions.get(feedUrl) ?? new Set();
    feedSubscriptions.add(subscription);
    this.subscriptions.set(feedUrl, feedSubscriptions);
  }

  public unsubscribe(args: {feedUrl: string}): void {
    const {feedUrl} = args;
    const feedSubscriptions = this.subscriptions.get(feedUrl);
    if (!feedSubscriptions) return;
    this.subscriptions.delete(feedUrl);
  }

  public getSubscriptions(args: {feedUrl: string}): Set<RssFeedSubscription> | null {
    const {feedUrl} = args;
    return this.subscriptions.get(feedUrl) ?? null;
  }
}
