import type {EmailAddress} from '@shared/types/emails.types';

export function isInternalAccount(args: {readonly email: EmailAddress}): boolean {
  const {email} = args;

  // TODO: Move this to an environment variable.
  return email === 'wenger.jacob@gmail.com';
}
