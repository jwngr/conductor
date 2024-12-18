import FirecrawlApp from '@mendable/firecrawl-js';
import {logger} from 'firebase-functions';
import {defineString} from 'firebase-functions/params';
import {onInit} from 'firebase-functions/v2/core';

import {asyncTry} from '@shared/lib/errors';

import {ParsedFirecrawlData, RawFirecrawlResponse} from '@shared/types/firecrawl.types';
import {AsyncResult, makeSuccessResult} from '@shared/types/result.types';

const FIRECRAWL_API_KEY = defineString('FIRECRAWL_API_KEY');

let firecrawlApp: FirecrawlApp;
onInit(() => {
  firecrawlApp = new FirecrawlApp({apiKey: FIRECRAWL_API_KEY.value()});
});

// Firecrawl is used for:
// 1. Markdown-formatted content for LLM prompt consumption (store in Cloud Storage).
// 2. Outgoing links referenced by the content (stored in Firestore).
export async function fetchFirecrawlData(url: string): AsyncResult<ParsedFirecrawlData> {
  const rawFirecrawlResult = await asyncTry<RawFirecrawlResponse>(async () => {
    const firecrawlScrapeUrl = await firecrawlApp.scrapeUrl(url, {
      formats: ['markdown', 'links'],
      waitFor: 1000,
    });
    if (!firecrawlScrapeUrl.success) {
      throw new Error(firecrawlScrapeUrl.error);
    }
    return firecrawlScrapeUrl as RawFirecrawlResponse;
  });

  if (!rawFirecrawlResult.success) {
    logger.error('Error fetching Firecrawl data', {error: rawFirecrawlResult.error, url});
    return rawFirecrawlResult;
  }

  const rawFirecrawlData = rawFirecrawlResult.value;

  // Some fields should always be present. Report them, but still allow the import to continue.
  if (!rawFirecrawlData.markdown) {
    logger.error('No markdown found in Firecrawl result');
  }
  if (!rawFirecrawlData.links) {
    logger.error('No links found in Firecrawl result');
  }

  return makeSuccessResult({
    title: rawFirecrawlData.metadata.title,
    description: rawFirecrawlData.metadata.description,
    // TODO: Process other metadata (e.g. keywords).
    markdown: rawFirecrawlData.markdown,
    links: rawFirecrawlData.links,
  });
}
