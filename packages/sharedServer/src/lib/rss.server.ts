import {parseFeed} from '@rowanmanning/feed-parser';
import type {Feed} from '@rowanmanning/feed-parser/lib/feed/base';

import {asyncTry, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {requestGet} from '@shared/lib/requests.shared';

import type {AsyncResult} from '@shared/types/results.types';

export async function parseRssFeed(url: string): AsyncResult<Feed, Error> {
  const rssFeedResult = await requestGet<string>(url);
  if (!rssFeedResult.success) {
    return prefixErrorResult(rssFeedResult, 'Error fetching RSS feed');
  }

  return await asyncTry(async () => parseFeed(rssFeedResult.value));
}
