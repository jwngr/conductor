import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {requestGet} from '@shared/lib/requests.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';

export async function fetchXkcdComic(url: string): AsyncResult<{
  readonly title: string;
  readonly imageUrl: string;
  readonly altText: string;
}> {
  const fetchDataResult = await requestGet<string>(url, {
    headers: {'Content-Type': 'text/html'},
  });

  if (!fetchDataResult.success) {
    return prefixErrorResult(fetchDataResult, 'Error fetching XKCD comic');
  }

  const rawHtml = fetchDataResult.value;
  console.log(rawHtml);

  return makeSuccessResult({
    title: 'XKCD Comic',
    imageUrl: 'https://xkcd.com/1234/image.png',
    altText: 'XKCD Comic',
  });
}
