import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {Result} from '@shared/types/results.types';

import {SuperfeedWebhookRequestBodySchema} from '@shared/schemas/superfeedr.schema';
import type {SuperfeedWebhookRequestBody} from '@shared/schemas/superfeedr.schema';

export function parseSuperfeedrWebhookRequestBody(
  maybeBody: unknown
): Result<SuperfeedWebhookRequestBody> {
  const parsedResult = parseZodResult(SuperfeedWebhookRequestBodySchema, maybeBody);
  return prefixResultIfError(parsedResult, 'Unexpected Superfeedr webhook request');
}
