import type {AsyncResult} from '@conductor/shared/src/types/results.types';
import {z} from 'zod';

export enum RssFeedProviderType {
  Local = 'LOCAL',
  Superfeedr = 'SUPERFEEDR',
}

export const RssFeedProviderTypeSchema = z.nativeEnum(RssFeedProviderType);

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
