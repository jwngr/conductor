import {defineString} from 'firebase-functions/params';

import {SUPERFEEDR_BASE_URL} from '@shared/lib/constants';

import {SuperfeedrResponse} from '@shared/types/superfeedr';

const SUPERFEEDR_USER = defineString('SUPERFEEDR_USER');
const SUPERFEEDR_API_KEY = defineString('SUPERFEEDR_API_KEY');

// TODO: Consider making this into a service. Perhaps I want `ServerFeedSubscriptionService` and
// `ClientFeedSubscriptionService`?
export async function subscribeToFeed(
  feedUrl: string
): Promise<[SuperfeedrResponse, Error | null]> {
  try {
    // Note: You'll need to set up your Superfeedr credentials in your environment variables
    const response = await fetch(SUPERFEEDR_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${SUPERFEEDR_USER.value()}:${SUPERFEEDR_API_KEY.value()}`).toString('base64')}`,
        // TODO: Maybe not needed?
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'hub.mode': 'subscribe',
        'hub.topic': feedUrl,
        // TODO: FIX ME.
        'hub.callback': `https://${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com/api/superfeedr-webhook`, // You'll need to implement this endpoint
        format: 'json',
      }),
    });

    if (!response.ok || response.status >= 400) {
      return [
        {status: response.status},
        new Error(`Superfeedr returned error status ${response.status}`),
      ];
    }

    const data = await response.text();
    console.log(`[SUBSCRIBE] Superfeedr response:`, data);
    console.log(`[SUBSCRIBE] Superfeedr response ok:`, response.ok);
    console.log(`[SUBSCRIBE] Superfeedr response statusText:`, response.statusText);
    return [{status: response.status, message: data}, null];
  } catch (error) {
    let betterError: Error;
    const prefix = 'Error subscribing to Superfeedr feed';
    if (error instanceof Error) {
      betterError = new Error(`${prefix}: ${error.message}`, {cause: error});
    } else {
      betterError = new Error(`${prefix}: ${error}`);
    }
    // TODO: Use logger.
    console.error(betterError.message, {error, feedUrl});
    return [{status: 500}, betterError];
  }
}
