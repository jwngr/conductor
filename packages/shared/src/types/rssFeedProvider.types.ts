import type {AsyncResult} from '@conductor/shared/src/types/results.types';

export interface RssFeedMetadata {
  readonly title: string;
  readonly description?: string;
  readonly link: string;
}

export interface RssFeedItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly link: string;
  readonly pubDate: Date;
  readonly content?: string;
}

export interface RssFeed {
  readonly metadata: RssFeedMetadata;
  readonly items: RssFeedItem[];
}

/** Provides a way to subscribe to RSS feeds and be notified of new items. */
export interface RssFeedProvider {
  subscribeToUrl(feedUrl: string): AsyncResult<void>;
  unsubscribeFromUrl(feedUrl: string): AsyncResult<void>;
}
