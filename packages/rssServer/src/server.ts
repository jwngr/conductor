import {serve} from '@hono/node-server';
import type {Feed} from '@rowanmanning/feed-parser/lib/feed/base';
import {Hono} from 'hono';
import type {Context} from 'hono';

import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';
import {requestPost} from '@shared/lib/requests.shared';

import type {RssFeed, RssFeedItem} from '@src/types';

interface Subscription {
  readonly feedUrl: string;
  readonly webhookBaseUrl: string;
}

export class RssServer {
  private readonly app: Hono;
  private readonly feeds: Map<string, RssFeed>;
  private readonly subscriptions: Map<string, Set<Subscription>>;
  private readonly port: number;

  constructor(args: {port: number}) {
    this.app = new Hono();
    this.feeds = new Map();
    this.subscriptions = new Map();
    this.port = args.port;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Serve RSS feeds
    this.app.get('/feed/:id', (c: Context) => {
      const feedId = c.req.param('id');
      const feed = this.feeds.get(feedId);

      if (!feed) {
        return c.text('Feed not found', 404);
      }

      const rss = this.convertToRss2(feed);
      return c.text(rss, 200, {
        'Content-Type': 'application/xml',
      });
    });

    // Subscribe to a feed
    this.app.post('/subscribe', async (c: Context) => {
      const {feedUrl, webhookBaseUrl} = await c.req.json();

      if (!feedUrl || !webhookBaseUrl) {
        return c.text('Missing required parameters', 400);
      }

      const subscription: Subscription = {
        feedUrl,
        webhookBaseUrl,
      };

      const feedSubscriptions = this.subscriptions.get(feedUrl) ?? new Set();
      feedSubscriptions.add(subscription);
      this.subscriptions.set(feedUrl, feedSubscriptions);

      return c.text('OK', 200);
    });

    // Unsubscribe from a feed
    this.app.post('/unsubscribe', async (c: Context) => {
      const {feedUrl} = await c.req.json();

      if (!feedUrl) {
        return c.text('Missing required parameters', 400);
      }

      const feedSubscriptions = this.subscriptions.get(feedUrl);
      if (feedSubscriptions) {
        feedSubscriptions.clear();
        if (feedSubscriptions.size === 0) {
          this.subscriptions.delete(feedUrl);
        }
      }

      return c.text('OK', 200);
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      serve(
        {
          fetch: this.app.fetch,
          port: this.port,
        },
        (info: {port: number}) => {
          logger.log('RSS server started', {port: info.port});
          resolve();
        }
      );
    });
  }

  public addFeed(feed: RssFeed): void {
    this.feeds.set(feed.id, feed);
  }

  public updateFeed(feedId: string, items: RssFeedItem[]): void {
    const feed = this.feeds.get(feedId);
    if (!feed) {
      throw new Error(`Feed ${feedId} not found`);
    }

    const updatedFeed = {
      ...feed,
      items: [...feed.items, ...items],
    };
    this.feeds.set(feedId, updatedFeed);

    // Notify subscribers via Firebase function
    const feedSubscriptions = this.subscriptions.get(feed.link);
    if (feedSubscriptions) {
      for (const subscription of feedSubscriptions) {
        const result = asyncTry(async () => {
          await requestPost(`${subscription.webhookBaseUrl}/handleSuperfeedrWebhook`, {
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
        });
        if (!result.success) {
          logger.error(prefixError(result.error, 'Error notifying feed subscribers'), {
            error: result.error,
            feedId,
            webhookBaseUrl: subscription.webhookBaseUrl,
          });
        }
      }
    }
  }

  private convertToRss2(feed: RssFeed): string {
    // Basic RSS 2.0 format
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${feed.title}</title>
    ${feed.description ? `<description>${feed.description}</description>` : ''}
    <link>${feed.link}</link>
    ${feed.items
      .map(
        (item: RssFeedItem) => `
    <item>
      <title>${item.title}</title>
      ${item.description ? `<description>${item.description}</description>` : ''}
      <link>${item.link}</link>
      <guid>${item.id}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      ${item.content ? `<content:encoded><![CDATA[${item.content}]]></content:encoded>` : ''}
    </item>`
      )
      .join('')}
  </channel>
</rss>`;
  }

  private convertToFeed(rssFeed: RssFeed): Feed {
    // Convert to the format expected by the feed parser
    const feed = {
      meta: {
        type: 'rss',
        version: '2.0',
      },
      language: null,
      title: rssFeed.title,
      description: rssFeed.description ?? null,
      copyright: null,
      url: rssFeed.link,
      self: null,
      published: null,
      updated: null,
      generator: null,
      image: null,
      authors: [],
      categories: [],
      items: rssFeed.items.map((item: RssFeedItem) => ({
        title: item.title,
        description: item.description ?? null,
        link: item.link,
        id: item.id,
        published: item.pubDate.toISOString(),
        content: item.content ?? null,
        feed: null as any, // Required by FeedItem type but not used in our mock
        element: null as any, // Required by FeedItem type but not used in our mock
        url: item.link,
        updated: item.pubDate.toISOString(),
        author: null,
        categories: [],
        enclosures: [],
        image: null,
        itunes: null,
        media: null,
      })),
    };
    return feed as unknown as Feed;
  }
}
