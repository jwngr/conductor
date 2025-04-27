import * as cheerio from 'cheerio';

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

// export async function fetchExplainXkcdContent(comicId: number): AsyncResult<string> {
//   const url = makeExplainXkcdUrl(comicId);

//   const fetchDataResult = await requestGet<string>(url, {
//     headers: {Accept: 'text/html'},
//   });

//   if (!fetchDataResult.success) return fetchDataResult;

//   const rawHtml = fetchDataResult.value;

//   console.log('RAW HTML:', rawHtml);

//   // const $ = cheerio.load(rawHtml);

//   // const title = $('#ctitle').text().trim();
//   // const imageElement = $('#comic img');
//   // const altText = imageElement.attr('title');
//   // const imageUrlSmall = imageElement.attr('src');
//   // const imageUrlLarge = imageElement.attr('srcset')?.split(' ')[0];

//   // if (!title || !imageUrlSmall || !imageUrlLarge || !altText) {
//   //   const error = new Error('Could not parse XKCD comic details from HTML');
//   //   logger.error(error, {url, title, imageUrlSmall, imageUrlLarge, altText});
//   //   return makeErrorResult(error);
//   // }

//   return makeSuccessResult(rawHtml);
// }
