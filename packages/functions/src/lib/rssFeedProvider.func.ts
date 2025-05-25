import {defineString} from 'firebase-functions/params';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever, isValidPort} from '@shared/lib/utils.shared';

import {parseRssFeedProviderType} from '@shared/parsers/rss.parser';

import type {Result} from '@shared/types/results.types';
import {RssFeedProviderType, type RssFeedProvider} from '@shared/types/rss.types';
import type {SuperfeedrCredentials} from '@shared/types/superfeedr.types';

import {LocalRssFeedProvider} from '@sharedServer/services/localRssFeedProvider';
import {SuperfeedrService} from '@sharedServer/services/superfeedr.server';

import {getFunctionsBaseUrl} from '@src/lib/env';

const LOCAL_RSS_FEED_PROVIDER_PORT = defineString('LOCAL_RSS_FEED_PROVIDER_PORT');
const RSS_FEED_PROVIDER_TYPE = defineString('RSS_FEED_PROVIDER_TYPE');
const SUPERFEEDR_USER = defineString('SUPERFEEDR_USER');
const SUPERFEEDR_API_KEY = defineString('SUPERFEEDR_API_KEY');
const SUPERFEEDR_WEBHOOK_SECRET = defineString('SUPERFEEDR_WEBHOOK_SECRET');
const LOCAL_RSS_FEED_PROVIDER_WEBHOOK_SECRET = defineString(
  'LOCAL_RSS_FEED_PROVIDER_WEBHOOK_SECRET'
);

export function getRssFeedProvider(): Result<RssFeedProvider> {
  const rawRssFeedProviderType = RSS_FEED_PROVIDER_TYPE.value();
  const uppercasedRssFeedProviderType = rawRssFeedProviderType.toUpperCase();
  const parsedFeedProviderTypeResult = parseRssFeedProviderType(uppercasedRssFeedProviderType);
  if (!parsedFeedProviderTypeResult.success) {
    const message = `RSS_FEED_PROVIDER_TYPE environment variable has invalid value: "${rawRssFeedProviderType}"`;
    return prefixErrorResult(parsedFeedProviderTypeResult, message);
  }

  const feedProviderType = parsedFeedProviderTypeResult.value;

  switch (feedProviderType) {
    case RssFeedProviderType.Local:
      return getLocalRssFeedProvider();
    case RssFeedProviderType.Superfeedr:
      return getSuperfeedrRssFeedProvider();
    default: {
      assertNever(feedProviderType);
    }
  }
}

function getLocalRssFeedProvider(): Result<RssFeedProvider> {
  // TODO: Consider using a different callback URL for the local feed provider.
  const callbackUrl = `${getFunctionsBaseUrl()}/handleSuperfeedrWebhook`;

  const port = parseInt(LOCAL_RSS_FEED_PROVIDER_PORT.value() ?? '', 10);
  if (isNaN(port) || !isValidPort(port)) {
    const message = `LOCAL_RSS_FEED_PROVIDER_PORT environment variable has invalid value: "${port}"`;
    return makeErrorResult(new Error(message));
  }

  const webhookSecret = LOCAL_RSS_FEED_PROVIDER_WEBHOOK_SECRET.value();
  if (webhookSecret.length === 0) {
    const message =
      'LOCAL_RSS_FEED_PROVIDER_WEBHOOK_SECRET environment variable must be set when Local RSS ' +
      'feed provider enabled. Generate via `openssl rand -hex 16`.';
    return makeErrorResult(new Error(message));
  }

  const rssFeedProvider = new LocalRssFeedProvider({port, callbackUrl, webhookSecret});

  return makeSuccessResult(rssFeedProvider);
}

function getSuperfeedrRssFeedProvider(): Result<RssFeedProvider> {
  const callbackUrl = `${getFunctionsBaseUrl()}/handleSuperfeedrWebhook`;

  const credentialsResult = validateSuperfeedrCredentials();
  if (!credentialsResult.success) {
    const message = 'Failed to initialize Superfeedr RSS feed provider';
    return prefixErrorResult(credentialsResult, message);
  }
  const credentials = credentialsResult.value;

  const webhookSecret = SUPERFEEDR_WEBHOOK_SECRET.value();
  if (webhookSecret.length === 0) {
    const message =
      'SUPERFEEDR_WEBHOOK_SECRET environment variable must be set when Superfeedr enabled. ' +
      'Generate via `openssl rand -hex 16`.';
    return makeErrorResult(new Error(message));
  }

  const rssFeedProvider = new SuperfeedrService({
    superfeedrUser: credentials.user,
    superfeedrApiKey: credentials.apiKey,
    callbackUrl,
    webhookSecret,
  });

  return makeSuccessResult(rssFeedProvider);
}

function validateSuperfeedrCredentials(): Result<SuperfeedrCredentials> {
  const rawSuperfeedrUser = SUPERFEEDR_USER.value();
  const rawSuperfeedrApiKey = SUPERFEEDR_API_KEY.value();

  if (rawSuperfeedrUser.length === 0) {
    const message = 'SUPERFEEDR_USER environment variable must be set when Superfeedr enabled';
    return makeErrorResult(new Error(message));
  }

  if (rawSuperfeedrApiKey.length === 0) {
    const message = 'SUPERFEEDR_API_KEY environment variable must be set when Superfeedr enabled';
    return makeErrorResult(new Error(message));
  }

  return makeSuccessResult({
    user: rawSuperfeedrUser,
    apiKey: rawSuperfeedrApiKey,
  });
}
