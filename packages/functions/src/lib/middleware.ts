import type {CallableRequest} from 'firebase-functions/v2/https';
import {HttpsError} from 'firebase-functions/v2/https';

import {parseUrl} from '@shared/lib/urls.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';

import type {AccountId} from '@shared/types/accounts.types';

export function verifyAuth(request: CallableRequest): AccountId {
  if (!request.auth) {
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const accountIdResult = parseAccountId(request.auth.uid);
  if (!accountIdResult.success) {
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('permission-denied', 'Invalid account ID');
  }

  return accountIdResult.value;
}

export function validateUrlParam(request: CallableRequest): URL {
  const data = request.data;
  const rawUrl = data?.url ?? null;

  if (!rawUrl) {
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('invalid-argument', 'No URL provided');
  }

  const parsedUrl = parseUrl(rawUrl);
  if (!parsedUrl) {
    // eslint-disable-next-line no-restricted-syntax
    throw new HttpsError('invalid-argument', 'URL is not valid');
  }

  return parsedUrl;
}
