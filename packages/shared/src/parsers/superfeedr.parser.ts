import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {Result} from '@shared/types/results.types';

import {SuperfeedrWebhookRequestBodySchema} from '@shared/schemas/superfeedr.schema';
import type {SuperfeedrWebhookRequestBody} from '@shared/schemas/superfeedr.schema';

export function parseSuperfeedrWebhookRequestBody(
  maybeBody: unknown
): Result<SuperfeedrWebhookRequestBody> {
  const parsedResult = parseZodResult(SuperfeedrWebhookRequestBodySchema, maybeBody);
  return prefixResultIfError(parsedResult, 'Unexpected Superfeedr webhook request');
}
