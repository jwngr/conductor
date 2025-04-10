import type FirecrawlApp from '@mendable/firecrawl-js';

import {asyncTry, prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {ParsedFirecrawlData, RawFirecrawlResponse} from '@shared/types/firecrawl.types';
import type {AsyncResult} from '@shared/types/results.types';

export class ServerFirecrawlService {
  constructor(private readonly firecrawlApp: FirecrawlApp) {}

  /**
   * Firecrawl is used for:
   * 1. Markdown-formatted content for LLM prompt consumption (store in Cloud Storage).
   * 2. Outgoing links referenced by the content (stored in Firestore).
   */
  public async fetchUrl(url: string): AsyncResult<ParsedFirecrawlData> {
    const rawFirecrawlResult = await asyncTry(async () => {
      const firecrawlScrapeUrlResult = await this.firecrawlApp.scrapeUrl(url, {
        formats: ['markdown', 'links'],
        waitFor: 1000,
      });
      if (!firecrawlScrapeUrlResult.success) {
        // Allow throwing here since we are inside `asyncTry`.
        // eslint-disable-next-line no-restricted-syntax
        throw new Error(firecrawlScrapeUrlResult.error);
      }
      return firecrawlScrapeUrlResult as RawFirecrawlResponse;
    });

    if (!rawFirecrawlResult.success) {
      return prefixErrorResult(rawFirecrawlResult, 'Error fetching Firecrawl data');
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
}
