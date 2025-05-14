import type {Feed} from '@rowanmanning/feed-parser/lib/feed/base';

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

export interface MockSuperfeedrConfig {
  readonly port: number;
  readonly webhookBaseUrl: string;
}

export interface MockSuperfeedrState {
  readonly subscribedFeeds: Set<string>;
  readonly webhookCallbacks: Map<string, (feed: Feed) => Promise<void>>;
}
