import * as cheerio from 'cheerio';

import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {requestGet} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';

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

interface XkcdComic {
  readonly title: string;
  readonly altText: string;
  readonly imageUrlSmall: string;
  readonly imageUrlLarge: string;
}

export async function fetchXkcdComic(url: string): AsyncResult<XkcdComic> {
  const fetchDataResult = await requestGet<string>(url, {
    headers: {Accept: 'text/html'},
  });

  if (!fetchDataResult.success) {
    return prefixErrorResult(fetchDataResult, 'Error fetching XKCD comic');
  }

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
