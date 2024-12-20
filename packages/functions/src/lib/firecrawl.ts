import FirecrawlApp from '@mendable/firecrawl-js';
import {defineString} from 'firebase-functions/params';
import {onInit} from 'firebase-functions/v2/core';

import {asyncTry, prefixError} from '@shared/lib/errors';

import {ParsedFirecrawlData, RawFirecrawlResponse} from '@shared/types/firecrawl.types';
import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

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
    const firecrawlScrapeUrlResult = await firecrawlApp.scrapeUrl(url, {
      formats: ['markdown', 'links'],
      waitFor: 1000,
    });
    if (!firecrawlScrapeUrlResult.success) {
      throw new Error(firecrawlScrapeUrlResult.error);
    }
    return firecrawlScrapeUrlResult as RawFirecrawlResponse;
  });

  if (!rawFirecrawlResult.success) {
    return makeErrorResult(prefixError(rawFirecrawlResult.error, 'Error fetching Firecrawl data'));
  }

  const rawFirecrawlData = rawFirecrawlResult.value;

  // Some fields should always be present. Report them, but still allow the import to continue.
  if (!rawFirecrawlData.markdown) {
    return makeErrorResult(new Error('Error fetching Firecrawl data: No markdown found.'));
  }
  if (!rawFirecrawlData.links) {
    return makeErrorResult(new Error('Error fetching Firecrawl data: No links found.'));
  }

  return makeSuccessResult({
    title: rawFirecrawlData.metadata.title,
    description: rawFirecrawlData.metadata.description,
    // TODO: Process other metadata (e.g. keywords).
    markdown: rawFirecrawlData.markdown,
    links: rawFirecrawlData.links,
  });
}
