import type {Request} from 'firebase-functions/v2/https';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {makeRssFeedSource} from '@shared/lib/feedSources.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {assertNever, batchAsyncResults, partition} from '@shared/lib/utils.shared';

import {parseSuperfeedrWebhookRequestBody} from '@shared/parsers/superfeedr.parser';

import type {FeedItem} from '@shared/types/feedItems.types';
import type {AsyncResult, ErrorResult, SuccessResult} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';
import {RssFeedProviderType} from '@shared/types/rss.types';
import type {Supplier} from '@shared/types/utils.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import {validateSuperfeedrWebhookSignature} from '@sharedServer/services/superfeedr.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';

/**
 * Implementation of the Superfeedr webhook handler.
 */
export async function handleSuperfeedrWebhookHelper(args: {
  readonly request: Request;
  readonly rssFeedProvider: RssFeedProvider;
  readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  readonly feedItemsService: ServerFeedItemsService;
}): AsyncResult<void, Error> {
  const {request, userFeedSubscriptionsService, feedItemsService, rssFeedProvider} = args;

  // TODO: Validate the request is from Superfeedr by checking some auth header.

  logger.log('[SUPERFEEDR] Received webhook request', {body: JSON.stringify(request.body)});

  // Verify the RSS feed provider that is initialized is for Superfeedr.
  switch (rssFeedProvider.type) {
    case RssFeedProviderType.Superfeedr:
      break;
    case RssFeedProviderType.Local: {
      const message = 'RSS feed provider is not Superfeedr';
      return makeErrorResult(new Error(message));
    }
    default:
      assertNever(rssFeedProvider.type);
  }

  // Parse the request from Superfeedr.
  const parseBodyResult = parseSuperfeedrWebhookRequestBody(request.body);
  if (!parseBodyResult.success) {
    const message = 'Error parsing webhook request';
    return makeErrorResult(prefixError(parseBodyResult.error, message));
  }

  const body = parseBodyResult.value;
  if (body.status.code !== 200) {
    const message = 'Webhook callback returned non-200 status';
    return makeErrorResult(new Error(message));
  }

  // Validate the webhook signature.
  const validateResult = validateSuperfeedrWebhookSignature({
    webhookSecret: rssFeedProvider.webhookSecret,
    headers: request.headers,
    body,
  });
  if (!validateResult.success) {
    const message = 'Error validating webhook signature';
    return makeErrorResult(prefixError(validateResult.error, message));
  }

  // Fetch all users subscribed to this RSS feed URL.
  const feedUrl = body.status.feed;
  const fetchSubsResult = await userFeedSubscriptionsService.fetchForRssFeedSourceByUrl(feedUrl);
  if (!fetchSubsResult.success) {
    const message = 'Error fetching subscribed accounts for RSS feed source';
    return makeErrorResult(prefixError(fetchSubsResult.error, message));
  }

  const userFeedSubscriptions = fetchSubsResult.value;

  // Make a list of supplier methods that create feed items.
  const createFeedItemResults: Array<Supplier<AsyncResult<FeedItem, Error>>> = [];
  body.items.forEach((item) => {
    logger.log(`[SUPERFEEDR] Processing item ${item.id}`, {item});

    userFeedSubscriptions.forEach((userFeedSubscription) => {
      const newFeedItemResult = async (): AsyncResult<FeedItem, Error> => {
        return await feedItemsService.createFeedItemFromUrl({
          feedSource: makeRssFeedSource({userFeedSubscription}),
          url: item.permalinkUrl,
          title: item.title,
          description: item.summary,
          // TODO: Set better initial values for these fields.
          outgoingLinks: [],
          summary: null,
          accountId: userFeedSubscription.accountId,
        });
      };
      createFeedItemResults.push(newFeedItemResult);
    });
  });

  // Execute the supplier methods in batches.
  const batchResult = await batchAsyncResults(createFeedItemResults, 10);
  if (!batchResult.success) {
    const message = 'Error batching feed item creation';
    return makeErrorResult(prefixError(batchResult.error, message));
  }

  // Log successes and errors.
  const newFeedItemResults = batchResult.value;
  const [newFeedItemSuccesses, newFeedItemErrors] = partition<
    SuccessResult<FeedItem>,
    ErrorResult<Error>
  >(newFeedItemResults, (result): result is SuccessResult<FeedItem> => result.success);
  logger.log(
    `[SUPERFEEDR] Successfully created ${newFeedItemSuccesses.length} feed items, encountered ${newFeedItemErrors.length} errors`,
    {
      successes: newFeedItemSuccesses.map((result) => result.value),
      errors: newFeedItemErrors.map((result) => result.error),
    }
  );

  if (newFeedItemErrors.length !== 0) {
    const message = 'Individual feed items failed to be created';
    return makeErrorResult(new Error(message));
  }

  return makeSuccessResult(undefined);
}
