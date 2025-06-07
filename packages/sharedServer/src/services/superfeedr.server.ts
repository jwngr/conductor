import crypto from 'node:crypto';
import type {IncomingHttpHeaders} from 'node:http2';

import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {requestPost} from '@shared/lib/requests.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult, Result} from '@shared/types/results.types';
import type {RssFeedProvider} from '@shared/types/rss.types';
import {RssFeedProviderType} from '@shared/types/rss.types';

import type {SuperfeedrWebhookRequestBody} from '@shared/schemas/superfeedr.schema';

const SUPERFEEDR_BASE_URL = 'https://push.superfeedr.com/';

export class SuperfeedrService implements RssFeedProvider {
  private readonly superfeedrUser: string;
  private readonly superfeedrApiKey: string;
  private readonly callbackUrl: string;
  public readonly webhookSecret: string;

  constructor(args: {
    readonly superfeedrUser: string;
    readonly superfeedrApiKey: string;
    readonly callbackUrl: string;
    readonly webhookSecret: string;
  }) {
    this.superfeedrUser = args.superfeedrUser;
    this.superfeedrApiKey = args.superfeedrApiKey;
    this.callbackUrl = args.callbackUrl;
    this.webhookSecret = args.webhookSecret;

    this.webhookSecret = args.webhookSecret;
    if (this.webhookSecret.trim().length === 0) {
      // eslint-disable-next-line no-restricted-syntax
      throw new Error('Invalid webhook secret');
    }
  }

  public readonly type = RssFeedProviderType.Superfeedr;
  // TODO: Should this be something else?

  private getSuperfeedrAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.superfeedrUser}:${this.superfeedrApiKey}`).toString('base64')}`;
  }

  private getSuperfeedrWebhookUrl(): string {
    // This path needs to match the Firebase Function name.
    return `${this.callbackUrl}/handleSuperfeedrWebhook`;
  }

  public async subscribeToUrl(feedUrl: string): AsyncResult<void, Error> {
    const result = await requestPost<string>(
      SUPERFEEDR_BASE_URL,
      {
        'hub.mode': 'subscribe',
        'hub.topic': feedUrl,
        'hub.callback': this.getSuperfeedrWebhookUrl(),
        'hub.secret': this.webhookSecret,
        format: 'json',
      },
      {
        headers: {
          Authorization: this.getSuperfeedrAuthHeader(),
        },
      }
    );

    if (!result.success) {
      return prefixErrorResult(result, 'Failed to subscribe to feed');
    }

    return makeSuccessResult(undefined);
  }

  public async unsubscribeFromUrl(feedUrl: string): AsyncResult<void, Error> {
    const result = await requestPost<undefined>(SUPERFEEDR_BASE_URL, {
      headers: {
        Authorization: this.getSuperfeedrAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'hub.mode': 'unsubscribe',
        'hub.topic': feedUrl,
        'hub.callback': this.getSuperfeedrWebhookUrl(),
        format: 'json',
      }),
    });

    if (!result.success) {
      return prefixErrorResult(result, 'Failed to unsubscribe from feed');
    }

    return makeSuccessResult(undefined);
  }
}

export function validateSuperfeedrWebhookSignature(args: {
  readonly webhookSecret: string;
  readonly headers: IncomingHttpHeaders;
  readonly body: SuperfeedrWebhookRequestBody;
}): Result<void, Error> {
  const {webhookSecret, headers, body} = args;

  // Validate the expected signature header is present.
  const receivedSignature = headers['x-hub-signature'];
  if (!receivedSignature || typeof receivedSignature !== 'string') {
    return makeErrorResult(new Error('Missing or invalid X-Hub-Signature header'));
  }

  // Create the expected signature from the secret.
  const hmac = crypto.createHmac('sha1', webhookSecret);
  hmac.update(JSON.stringify(body));
  const expectedSignature = `sha1=${hmac.digest('hex')}`;

  // Ensure timing-safe signature match.
  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return makeErrorResult(new Error('Superfeedr webhook signature is invalid'));
  }

  return makeSuccessResult(undefined);
}
