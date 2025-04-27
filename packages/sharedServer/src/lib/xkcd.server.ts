import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

import {logger} from '@shared/services/logger.shared';

import {requestGet} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult, Result} from '@shared/types/results.types';

function makeAbsoluteXkcdUrl(relativeUrl: string, feedItemUrl: string): string {
  let absoluteUrl = relativeUrl;
  if (relativeUrl.startsWith('//')) {
    absoluteUrl = `https:${relativeUrl}`;
  } else if (relativeUrl.startsWith('/')) {
    const {origin} = new URL(feedItemUrl);
    absoluteUrl = `${origin}${relativeUrl}`;
  }

  return absoluteUrl;
}

export function makeExplainXkcdUrl(comicId: number): string {
  return `https://www.explainxkcd.com/wiki/index.php/${comicId}`;
}

/**
 * Extracts the comic ID from an XKCD URL. XKCD URLs look like https://xkcd.com/1234/.
 */
export function parseXkcdComicIdFromUrl(url: string): Result<number> {
  const match = url.match(/xkcd\.com\/(\d+)/);
  if (!match || match.length !== 2) {
    return makeErrorResult(new Error('XKCD URL does not match expected format'));
  }
  const comicId = parseInt(match[1], 10);
  if (isNaN(comicId)) {
    return makeErrorResult(new Error('XKCD comic ID is not a number'));
  }
  return makeSuccessResult(comicId);
}

interface XkcdComic {
  readonly title: string;
  readonly altText: string;
  readonly imageUrlSmall: string;
  readonly imageUrlLarge: string;
}

interface ExplainXkcdContent {
  readonly explanationMarkdown: string;
  readonly transcriptMarkdown: string | null;
}

export async function fetchXkcdComic(comicId: number): AsyncResult<XkcdComic> {
  const url = `https://xkcd.com/${comicId}`;

  const fetchDataResult = await requestGet<string>(url, {
    headers: {Accept: 'text/html'},
  });

  if (!fetchDataResult.success) return fetchDataResult;

  const rawHtml = fetchDataResult.value;

  const $ = cheerio.load(rawHtml);

  const title = $('#ctitle').text().trim();
  const imageElement = $('#comic img');
  const altText = imageElement.attr('title');
  const imageUrlSmall = imageElement.attr('src');
  const imageUrlLarge = imageElement.attr('srcset')?.split(' ')[0];

  if (!title || !imageUrlSmall || !imageUrlLarge || !altText) {
    const error = new Error('Could not parse XKCD comic details from HTML');
    logger.error(error, {url, title, imageUrlSmall, imageUrlLarge, altText});
    return makeErrorResult(error);
  }

  return makeSuccessResult({
    title,
    altText,
    imageUrlSmall: makeAbsoluteXkcdUrl(imageUrlSmall, url),
    imageUrlLarge: makeAbsoluteXkcdUrl(imageUrlLarge, url),
  });
}

export async function fetchExplainXkcdContent(comicId: number): AsyncResult<ExplainXkcdContent> {
  const url = makeExplainXkcdUrl(comicId);

  const fetchDataResult = await requestGet<string>(url, {
    headers: {Accept: 'text/html'},
  });

  if (!fetchDataResult.success) return fetchDataResult;

  const rawHtml = fetchDataResult.value;

  const $ = cheerio.load(rawHtml);
  const turndownService = new TurndownService();

  let explanationMarkdown: string | null = null;
  let transcriptMarkdown: string | null = null;

  // Find the Explanation heading
  const explanationHeading = $('#Explanation').parent('h2');
  if (explanationHeading.length > 0) {
    let nextElement = explanationHeading.next();
    let explanationHtml = '';
    while (nextElement.length > 0 && !nextElement.is('h2')) {
      explanationHtml += $.html(nextElement);
      nextElement = nextElement.next();
    }
    if (explanationHtml) {
      explanationMarkdown = turndownService.turndown(explanationHtml).trim();
    }
  }

  if (!explanationMarkdown) {
    const error = new Error('Could not parse explanation from Explain XKCD page');
    logger.error(error, {url, comicId});
    return makeErrorResult(error);
  }

  // Find the Transcript heading
  const transcriptHeading = $('#Transcript').parent('h2');
  if (transcriptHeading.length > 0) {
    let nextElement = transcriptHeading.next();
    let transcriptHtml = '';
    // Collect elements until the next h2 or the end of the container
    while (nextElement.length > 0 && !nextElement.is('h2')) {
      // Check if the element is within the main content area if necessary
      // This logic might need adjustment based on the exact HTML structure of explainxkcd
      transcriptHtml += $.html(nextElement);
      nextElement = nextElement.next();
    }
    if (transcriptHtml) {
      transcriptMarkdown = turndownService.turndown(transcriptHtml).trim();
    }
  }

  return makeSuccessResult({
    explanationMarkdown,
    transcriptMarkdown,
  });
}
