import type {AsyncResult, Result} from '@conductor/shared/src/types/results.types';

export enum RssFeedProviderType {
  Local = 'LOCAL',
  Superfeedr = 'SUPERFEEDR',
}

/** Provides a way to subscribe to RSS feeds and be notified of new items. */
export interface RssFeedProvider {
  readonly type: RssFeedProviderType;
  readonly webhookSecret: string;
  subscribeToUrl(feedUrl: string): AsyncResult<void, Error>;
  unsubscribeFromUrl(feedUrl: string): AsyncResult<void, Error>;
}

export interface RssFeed {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly link: string;
  readonly items: RssFeedItem[];
}

export interface RssFeedItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly link: string;
  readonly pubDate: Date;
  readonly content?: string;
}

export interface RssFeedSubscription {
  readonly feedUrl: string;
  readonly callbackUrl: string;
}

export interface RssFeedManager {
  getFeed(args: {feedId: string}): RssFeed | null;
  addFeed(args: {feed: RssFeed}): Result<void, Error>;
  updateFeed(args: {feedId: string; items: RssFeedItem[]}): AsyncResult<void, Error>;
  subscribe(args: {feedUrl: string; callbackUrl: string}): void;
  unsubscribe(args: {feedUrl: string}): void;
  getSubscriptions(args: {feedUrl: string}): Set<RssFeedSubscription> | null;
}
