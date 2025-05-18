// Import types from express instead
import type {Request, Response} from 'express';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {makeRssFeedSource} from '@shared/lib/feedSources.shared';
import {batchAsyncResults, partition} from '@shared/lib/utils.shared';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {AsyncResult, ErrorResult, SuccessResult} from '@shared/types/results.types';
import {parseSuperfeedrWebhookRequestBody} from '@shared/types/superfeedr.types';
import type {Supplier} from '@shared/types/utils.types';

import type {ServerFeedItemsService} from '@sharedServer/services/feedItems.server';
import type {ServerUserFeedSubscriptionsService} from '@sharedServer/services/userFeedSubscriptions.server';

/**
 * Implementation of the Superfeedr webhook handler.
 */
export async function handleSuperfeedrWebhookHelper(args: {
  readonly request: Request;
  readonly response: Response;
  readonly userFeedSubscriptionsService: ServerUserFeedSubscriptionsService;
  readonly feedItemsService: ServerFeedItemsService;
  // TODO: Use AsyncResult here.
}): Promise<void> {
  const {request, response, userFeedSubscriptionsService, feedItemsService} = args;

  const respondWithError = (
    error: Error,
    errorPrefix = '',
    logDetails: Record<string, unknown> = {}
  ): void => {
    const betterError = prefixError(error, `[SUPERFEEDR] ${errorPrefix}`);
    logger.error(betterError, {body: request.body, ...logDetails});
    response.status(400).json({success: false, error: betterError.message});
    return;
  };

  // TODO: Validate the request is from Superfeedr by checking some auth header.

  logger.log('[SUPERFEEDR] Received webhook request', {body: JSON.stringify(request.body)});

  // Parse the request from Superfeedr.
  const parseResult = parseSuperfeedrWebhookRequestBody(request.body);
  if (!parseResult.success) {
    respondWithError(parseResult.error, 'Error parsing webhook request');
    return;
  }

  const body = parseResult.value;
  if (body.status.code !== 200) {
    respondWithError(new Error('Webhook callback returned non-200 status'));
    return;
  }

  // Fetch all users subscribed to this RSS feed URL.
  const feedUrl = body.status.feed;
  const fetchSubsResult = await userFeedSubscriptionsService.fetchForRssFeedSourceByUrl(feedUrl);
  if (!fetchSubsResult.success) {
    const message = 'Error fetching subscribed accounts for RSS feed source';
    respondWithError(fetchSubsResult.error, message, {feedUrl});
    return;
  }

  const userFeedSubscriptions = fetchSubsResult.value;

  // Make a list of supplier methods that create feed items.
  const createFeedItemResults: Array<Supplier<AsyncResult<FeedItemId | null>>> = [];
  body.items.forEach((item) => {
    logger.log(`[SUPERFEEDR] Processing item ${item.id}`, {item});

    userFeedSubscriptions.forEach((userFeedSubscription) => {
      const newFeedItemResult = async (): AsyncResult<FeedItemId | null> => {
        return await feedItemsService.createFeedItem(makeRssFeedSource({userFeedSubscription}), {
          url: item.permalinkUrl,
          accountId: userFeedSubscription.accountId,
          title: item.title,
          description: item.summary,
        });
      };
      createFeedItemResults.push(newFeedItemResult);
    });
  });

  // Execute the supplier methods in batches.
  const batchResult = await batchAsyncResults(createFeedItemResults, 10);
  if (!batchResult.success) {
    respondWithError(batchResult.error, 'Error batching feed item creation');
    return;
  }

  // Log successes and errors.
  const newFeedItemResults = batchResult.value;
  const [newFeedItemSuccesses, newFeedItemErrors] = partition<
    SuccessResult<FeedItemId | null>,
    ErrorResult
  >(newFeedItemResults, (result): result is SuccessResult<FeedItemId | null> => result.success);
  logger.log(
    `[SUPERFEEDR] Successfully created ${newFeedItemSuccesses.length} feed items, encountered ${newFeedItemErrors.length} errors`,
    {
      successes: newFeedItemSuccesses.map((result) => result.value),
      errors: newFeedItemErrors.map((result) => result.error),
    }
  );

  if (newFeedItemErrors.length !== 0) {
    respondWithError(new Error('Individual feed items failed to be created'), undefined, {
      errors: newFeedItemErrors.map((result) => result.error),
    });
    return;
  }

  response.status(200).json({success: true, value: undefined});
}
