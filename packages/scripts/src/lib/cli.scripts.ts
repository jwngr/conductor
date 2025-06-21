import arg from 'arg';

import {logger} from '@shared/services/logger.shared';

import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import {parseEmailAddress} from '@shared/parsers/emails.parser';

import type {EmailAddress} from '@shared/types/emails.types';
import type {Result} from '@shared/types/results.types';

import {env} from '@src/lib/environment.scripts';

export function getEmailForScript(): Result<EmailAddress, Error> {
  const flags = arg({
    '--email': String,
    '-e': '--email',
  });

  let email: string | undefined;
  const emailFromFlags: string | undefined = flags['--email'];

  // Use the email from the command line if provided. Otherwise, use the email from the environment.
  if (emailFromFlags) {
    email = emailFromFlags;
  } else {
    const emailFromEnv = env.localEmailAddress;
    if (emailFromEnv) {
      const message = `No email provided, using LOCAL_EMAIL_ADDRESS environment variable: ${emailFromEnv}`;
      logger.log(message);
      email = emailFromEnv;
    }
  }

  if (!email) {
    return makeErrorResult(new Error('No email provided'));
  }

  const parseEmailResult = parseEmailAddress(email);
  if (!parseEmailResult.success) {
    return makeErrorResult(new Error('Provided email address is invalid'));
  }

  return makeSuccessResult(parseEmailResult.value);
}
