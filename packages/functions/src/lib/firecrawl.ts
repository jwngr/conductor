import FirecrawlApp from '@mendable/firecrawl-js';
import {defineString} from 'firebase-functions/params';
import {onInit} from 'firebase-functions/v2/core';

// Environment variables.
const FIRECRAWL_API_KEY = defineString('FIRECRAWL_API_KEY');

let firecrawlApp: FirecrawlApp;
onInit(() => {
  firecrawlApp = new FirecrawlApp({apiKey: FIRECRAWL_API_KEY.value()});
});

interface ParsedFirecrawlData {
  readonly title: string | null;
  readonly description: string | null;
  readonly markdown: string | null;
  readonly links: string[] | null;
}

// Firecrawl is used for:
// 1. Markdown-formatted content for LLM prompt consumption (store in Cloud Storage).
// 2. Outgoing links referenced by the content (stored in Firestore).
export async function fetchFirecrawlData(url: string): Promise<ParsedFirecrawlData> {
  try {
    const firecrawlResult = await firecrawlApp.scrapeUrl(url, {
      formats: ['markdown', 'links'],
      waitFor: 1000,
    });

    if (!firecrawlResult.success) {
      throw new Error(firecrawlResult.error);
    }

    // Some fields should always be present. Report them, but still allow the import to continue.
    if (!firecrawlResult.markdown) {
      console.error('No markdown found in Firecrawl result');
    }
    if (!firecrawlResult.links) {
      console.error('No links found in Firecrawl result');
    }

    return {
      title: firecrawlResult.metadata?.title ?? null,
      description: firecrawlResult.metadata?.description ?? null,
      // TODO: Process other metadata (e.g. keywords).
      markdown: firecrawlResult.markdown ?? null,
      links: firecrawlResult.links ?? null,
    };
  } catch (error) {
    // Report the failure, but allow the import to continue.
    console.error(`Error fetching Firecrawl data:`, error);
    return {title: null, description: null, markdown: null, links: null};
  }
}
