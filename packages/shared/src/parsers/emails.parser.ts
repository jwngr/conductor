import {prefixErrorResult} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {EmailAddress} from '@shared/types/emails.types';
import type {Result} from '@shared/types/results.types';

import {EmailAddressSchema} from '@shared/schemas/emails.schema';

/**
 * Attempts to parse an unknown value into an {@link EmailAddress}.
 */
export function parseEmailAddress(maybeEmail: string): Result<EmailAddress> {
  const parsedResult = parseZodResult(EmailAddressSchema, maybeEmail);
  if (!parsedResult.success) return prefixErrorResult(parsedResult, 'Invalid email address');
  return makeSuccessResult(parsedResult.value as EmailAddress);
}
