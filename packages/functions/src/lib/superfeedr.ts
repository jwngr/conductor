import {defineString} from 'firebase-functions/params';

import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

const SUPERFEEDR_USER = defineString('SUPERFEEDR_USER');
const SUPERFEEDR_API_KEY = defineString('SUPERFEEDR_API_KEY');
const SUPERFEEDR_BASE_URL = 'https://push.superfeedr.com/';

// TODO: Confirm if this is actually needed.
// interface SuperfeedrResponse {
//   readonly status: number;
//   readonly message?: string;
// }

export class SuperfeedrService {
  private readonly superfeedrUser: string;
  private readonly superfeedrApiKey: string;
  constructor(args: {readonly superfeedrUser: string; readonly superfeedrApiKey: string}) {
    const {superfeedrUser, superfeedrApiKey} = args;
    this.superfeedrUser = superfeedrUser;
    this.superfeedrApiKey = superfeedrApiKey;
  }

  private getSuperfeedrAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.superfeedrUser}:${this.superfeedrApiKey}`).toString('base64')}`;
  }

  private getSuperfeedrWebhookUrl(): string {
    // TODO: FIX ME.
    return `https://${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com/api/superfeedr-webhook`;
  }

  public async subscribeToFeed(
    feedUrl: string
    // TODO Confirm what the return type actually is.
  ): AsyncResult<string> {
    const superfeedrResponse = await fetch(SUPERFEEDR_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: this.getSuperfeedrAuthHeader(),
        // TODO: Maybe not needed?
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'hub.mode': 'subscribe',
        'hub.topic': feedUrl,
        'hub.callback': this.getSuperfeedrWebhookUrl(),
        format: 'json',
      }),
    });

    const responseText = await superfeedrResponse.text();

    if (!superfeedrResponse.ok || superfeedrResponse.status >= 400) {
      return makeErrorResult(
        new Error(
          `Error while subscribing to feed ${feedUrl} with Superfeedr: [${superfeedrResponse.status}] ${responseText}`
        )
      );
    }

    const data = await superfeedrResponse.text();
    return makeSuccessResult(data);
  }

  public async unsubscribeFromFeed(feedUrl: string): AsyncResult<void> {
    const superfeedrResponse = await fetch(SUPERFEEDR_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: this.getSuperfeedrAuthHeader(),
        // TODO: Maybe not needed?
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'hub.mode': 'unsubscribe',
        'hub.topic': feedUrl,
        'hub.callback': this.getSuperfeedrWebhookUrl(),
        format: 'json',
      }),
    });

    const responseText = await superfeedrResponse.text();

    if (!superfeedrResponse.ok || superfeedrResponse.status >= 400) {
      return makeErrorResult(
        new Error(
          `Error while unsubscribing from feed ${feedUrl} with Superfeedr: [${superfeedrResponse.status}] ${responseText}`
        )
      );
    }

    return makeSuccessResult(undefined);
  }
}

export const superfeedrService = new SuperfeedrService({
  superfeedrUser: SUPERFEEDR_USER.value(),
  superfeedrApiKey: SUPERFEEDR_API_KEY.value(),
});
