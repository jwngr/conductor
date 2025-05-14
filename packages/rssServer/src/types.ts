import type {RssFeed, RssFeedItem} from '@shared/types/rssFeedProvider.types';

export interface RssServerConfig {
  readonly port: number;
  readonly webhookBaseUrl: string;
}

export interface RssServerState {
  readonly subscribedFeeds: Set<string>;
  readonly webhookCallbacks: Map<string, (feed: RssFeed) => Promise<void>>;
}

export interface RssFeed {
  id: string;
  title: string;
  description?: string;
  link: string;
  items: RssFeedItem[];
}

export interface RssFeedItem {
  id: string;
  title: string;
  description?: string;
  link: string;
  pubDate: Date;
  content?: string;
}
