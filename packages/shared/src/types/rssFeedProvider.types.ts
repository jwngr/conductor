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
  /** Subscribes to a feed URL. */
  subscribe(feedUrl: string): AsyncResult<void>;

  /** Unsubscribes from a feed URL. */
  unsubscribe(feedUrl: string): AsyncResult<void>;
}
