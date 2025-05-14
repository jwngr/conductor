import {serve} from '@hono/node-server';
import type {Feed} from '@rowanmanning/feed-parser/lib/feed/base';
import {Hono} from 'hono';
import type {Context} from 'hono';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';

import type {MockSuperfeedrConfig, MockSuperfeedrState, RssFeed, RssFeedItem} from '@src/types';

export class RssServer {
  private readonly app: Hono;
  private readonly feeds: Map<string, RssFeed>;
  private readonly superfeedrState: MockSuperfeedrState;
  private readonly config: MockSuperfeedrConfig;

  constructor(config: MockSuperfeedrConfig) {
    this.app = new Hono();
    this.feeds = new Map();
    this.superfeedrState = {
      subscribedFeeds: new Set(),
      webhookCallbacks: new Map(),
    };
    this.config = config;

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

      // Convert feed to RSS 2.0 format
      const rss = this.convertToRss2(feed);
      return c.text(rss, 200, {
        'Content-Type': 'application/xml',
      });
    });

    // Superfeedr subscription endpoint
    this.app.post('/superfeedr/subscribe', async (c: Context) => {
      const formData = await c.req.formData();
      const topic = formData.get('hub.topic') as string;
      const callback = formData.get('hub.callback') as string;

      if (!topic || !callback) {
        return c.text('Missing required parameters', 400);
      }

      this.superfeedrState.subscribedFeeds.add(topic);
      this.superfeedrState.webhookCallbacks.set(topic, async (feed) => {
        try {
          await fetch(callback, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(feed),
          });
        } catch (error) {
          logger.error('Error calling webhook', {error, callback});
        }
      });

      return c.text('OK', 200);
    });

    // Superfeedr unsubscribe endpoint
    this.app.post('/superfeedr/unsubscribe', async (c: Context) => {
      const formData = await c.req.formData();
      const topic = formData.get('hub.topic') as string;

      if (!topic) {
        return c.text('Missing topic parameter', 400);
      }

      this.superfeedrState.subscribedFeeds.delete(topic);
      this.superfeedrState.webhookCallbacks.delete(topic);

      return c.text('OK', 200);
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      serve(
        {
          fetch: this.app.fetch,
          port: this.config.port,
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

    this.feeds.set(feedId, {
      ...feed,
      items: [...feed.items, ...items],
    });

    // Notify Superfeedr subscribers
    if (this.superfeedrState.subscribedFeeds.has(feed.link)) {
      const callback = this.superfeedrState.webhookCallbacks.get(feed.link);
      if (callback) {
        callback(this.convertToFeed(feed)).catch((error) => {
          logger.error(prefixError(error, 'Error notifying Superfeedr subscribers'), {
            error,
            feedId,
          });
        });
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
        (item) => `
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
      items: rssFeed.items.map((item) => ({
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
