import {logger} from '@shared/services/logger.shared';

import {prefixError, upgradeUnknownError} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {parseUrl} from '@shared/lib/urls.shared';

import type {Result} from '@shared/types/results.types';

/**
 * Converts a relative XKCD URL to an absolute URL. Used for converting relative image URLs to
 * absolute URLs.
 */
export function makeAbsoluteXkcdUrl(relativeUrl: string, feedItemUrl: string): string {
  let absoluteUrl = relativeUrl;
  if (relativeUrl.startsWith('//')) {
    absoluteUrl = `https:${relativeUrl}`;
  } else if (relativeUrl.startsWith('/')) {
    const parsedUrl = parseUrl(feedItemUrl);
    if (!parsedUrl) return relativeUrl;
    const {origin} = parsedUrl;
    absoluteUrl = `${origin}${relativeUrl}`;
  }

  return absoluteUrl;
}

/**
 * Returns the URL for the Explain XKCD page for a given comic ID.
 */
export function makeExplainXkcdUrl(comicId: number): string {
  return `https://www.explainxkcd.com/wiki/index.php/${comicId}`;
}

/**
 * Returns true if the URL is a valid XKCD comic URL.
 */
export function isXkcdComicUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?xkcd\.com\/(\d+)\/?$/.test(url);
}

/**
 * Extracts the comic ID from an XKCD URL. XKCD URLs look like https://xkcd.com/1234/.
 */
export function parseXkcdComicIdFromUrl(url: string): Result<number> {
  // eslint-disable-next-line no-restricted-syntax
  try {
    const parsedUrl = parseUrl(url);
    if (!parsedUrl) {
      return makeErrorResult(new Error('Failed to parse XKCD URL'));
    }
    const {hostname, pathname} = parsedUrl;
    if (!/(^|\.)xkcd\.com$/.test(hostname)) {
      return makeErrorResult(new Error('URL host is not xkcd.com'));
    }
    const match = pathname.match(/^\/(\d+)\/?$/);
    if (!match) {
      return makeErrorResult(new Error('Path does not contain a comic id'));
    }
    const comicId = Number(match[1]);
    if (isNaN(comicId)) {
      return makeErrorResult(new Error('XKCD comic ID is not a number'));
    }
    return makeSuccessResult(comicId);
  } catch (error) {
    const betterError = prefixError(
      upgradeUnknownError(error),
      'Error parsing XKCD comic ID from URL'
    );
    logger.error(betterError, {url});
    return makeErrorResult(betterError);
  }
}
