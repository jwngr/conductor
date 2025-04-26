import * as cheerio from 'cheerio';

import {logger} from '@shared/services/logger.shared';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {requestGet} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';

interface XkcdComic {
  readonly title: string;
  readonly imageUrl: string;
  readonly altText: string;
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
  const imageUrl = imageElement.attr('src');
  const altText = imageElement.attr('title');

  if (!title || !imageUrl || !altText) {
    const error = new Error('Could not parse XKCD comic details from HTML');
    logger.error(error, {url, title, imageUrl, altText});
    return makeErrorResult(error);
  }

  // Ensure the image URL is absolute
  const absoluteImageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;

  return makeSuccessResult({
    title: title,
    imageUrl: absoluteImageUrl,
    altText: altText,
  });
}
