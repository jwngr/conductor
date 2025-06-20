import type {EmailAddress} from '@shared/types/emails.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an {@link Account}'s unique identifier. Prefer this over plain strings.
 */
export type AccountId = string & {readonly __brand: 'AccountIdBrand'};

/**
 * A generic type representing an account.
 */
export interface Account extends BaseStoreItem {
  readonly accountId: AccountId;
  readonly email: EmailAddress;
  readonly displayName?: string;
  // TODO: Add photo URL.
  // readonly photoUrl: string;
}
