import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';
import {requestGet, requestPost} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {RssFeed, RssFeedProvider} from '@shared/types/rssFeedProvider.types';

const LOCAL_RSS_SERVER_PORT = 3000;
const LOCAL_RSS_SERVER_URL = `http://localhost:${LOCAL_RSS_SERVER_PORT}`;

export class LocalRssFeedProvider implements RssFeedProvider {
  private readonly webhookBaseUrl: string;

  constructor(args: {readonly webhookBaseUrl: string}) {
    this.webhookBaseUrl = args.webhookBaseUrl;
  }

  public async subscribe(feedUrl: string): AsyncResult<void> {
    // Subscribe to the feed on the RSS server
    const result = await requestPost(`${LOCAL_RSS_SERVER_URL}/subscribe`, {
      feedUrl,
      webhookBaseUrl: this.webhookBaseUrl,
    });

    if (!result.success) {
      return makeErrorResult(new Error(`Failed to subscribe to feed: ${result.error.message}`));
    }

    return makeSuccessResult(undefined);
  }

  public async unsubscribe(feedUrl: string): AsyncResult<void> {
    // Unsubscribe from the feed on the RSS server
    const result = await requestPost(`${LOCAL_RSS_SERVER_URL}/unsubscribe`, {
      feedUrl,
    });

    if (!result.success) {
      return makeErrorResult(new Error(`Failed to unsubscribe from feed: ${result.error.message}`));
    }

    return makeSuccessResult(undefined);
  }

  public async getFeed(feedUrl: string): AsyncResult<RssFeed> {
    const result = await requestGet<string>(
      `${LOCAL_RSS_SERVER_URL}/feed/${encodeURIComponent(feedUrl)}`
    );

    if (!result.success) {
      return makeErrorResult(new Error(`Failed to get feed: ${result.error.message}`));
    }

    // Parse the RSS feed from the response
    const parser = new DOMParser();
    const doc = parser.parseFromString(result.value, 'application/xml');

    // Extract feed metadata
    const channel = doc.querySelector('channel');
    if (!channel) {
      return makeErrorResult(new Error('Invalid RSS feed: missing channel element'));
    }

    const metadata = {
      title: channel.querySelector('title')?.textContent ?? '',
      description: channel.querySelector('description')?.textContent ?? undefined,
      link: channel.querySelector('link')?.textContent ?? '',
    };

    // Extract feed items
    const items = Array.from(channel.querySelectorAll('item')).map((item) => ({
      id: item.querySelector('guid')?.textContent ?? '',
      title: item.querySelector('title')?.textContent ?? '',
      description: item.querySelector('description')?.textContent ?? undefined,
      link: item.querySelector('link')?.textContent ?? '',
      pubDate: new Date(item.querySelector('pubDate')?.textContent ?? ''),
      content: item.querySelector('content\\:encoded')?.textContent ?? undefined,
    }));

    return makeSuccessResult({metadata, items});
  }
}
