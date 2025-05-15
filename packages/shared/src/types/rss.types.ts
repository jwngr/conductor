import type {AsyncResult, Result} from '@conductor/shared/src/types/results.types';
import {z} from 'zod';

export type RssFeedProviderType = 'local' | 'superfeedr';

export const RssFeedProviderTypeSchema = z.union([z.literal('local'), z.literal('superfeedr')]);

/** Provides a way to subscribe to RSS feeds and be notified of new items. */
export interface RssFeedProvider {
  subscribeToUrl(feedUrl: string): AsyncResult<void>;
  unsubscribeFromUrl(feedUrl: string): AsyncResult<void>;
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
  addFeed(args: {feed: RssFeed}): Result<void>;
  updateFeed(args: {feedId: string; items: RssFeedItem[]}): AsyncResult<void>;
  subscribe(args: {feedUrl: string; callbackUrl: string}): void;
  unsubscribe(args: {feedUrl: string}): void;
  getSubscriptions(args: {feedUrl: string}): Set<RssFeedSubscription> | null;
}
