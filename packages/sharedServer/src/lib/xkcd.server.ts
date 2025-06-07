import * as cheerio from 'cheerio';

import {logger} from '@shared/services/logger.shared';

import {requestGet} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {makeAbsoluteXkcdUrl, makeExplainXkcdUrl} from '@shared/lib/xkcd.shared';

import type {AsyncResult} from '@shared/types/results.types';
import type {ExplainXkcdContent, XkcdComic} from '@shared/types/xkcd.types';

import {htmlToMarkdown} from '@sharedServer/lib/markdown.server';

export async function fetchXkcdComic(comicId: number): AsyncResult<XkcdComic, Error> {
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

export async function fetchExplainXkcdContent(
  comicId: number
): AsyncResult<ExplainXkcdContent, Error> {
  const url = makeExplainXkcdUrl(comicId);

  const fetchDataResult = await requestGet<string>(url, {
    headers: {Accept: 'text/html'},
  });

  if (!fetchDataResult.success) return fetchDataResult;

  const rawHtml = fetchDataResult.value;

  const $ = cheerio.load(rawHtml);

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

    const trimmedExplanationHtml = explanationHtml.trim();
    if (trimmedExplanationHtml.length === 0) {
      const error = new Error('Could not parse explanation from Explain XKCD page');
      logger.error(error, {url, comicId});
      return makeErrorResult(error);
    }

    const explanationMarkdownResult = htmlToMarkdown(trimmedExplanationHtml);
    if (!explanationMarkdownResult.success) {
      const error = new Error('Error converting explanation HTML to Markdown');
      logger.error(error, {url, comicId, explanationHtml});
      return makeErrorResult(error);
    }
    explanationMarkdown = explanationMarkdownResult.value;
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

    const trimmedTranscriptHtml = transcriptHtml.trim();
    if (trimmedTranscriptHtml.length === 0) {
      const error = new Error('Could not parse transcript from Explain XKCD page');
      logger.error(error, {url, comicId});
      return makeErrorResult(error);
    }

    const transcriptMarkdownResult = htmlToMarkdown(trimmedTranscriptHtml);
    if (!transcriptMarkdownResult.success) {
      const error = new Error('Error converting transcript HTML to Markdown');
      logger.error(error, {url, comicId, transcriptHtml});
      return makeErrorResult(error);
    }
    transcriptMarkdown = transcriptMarkdownResult.value;
  }

  return makeSuccessResult({
    explanationMarkdown,
    transcriptMarkdown,
  });
}
