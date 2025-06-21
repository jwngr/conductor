import type {EmailAddress} from '@shared/types/emails.types';
import type {AccountId} from '@shared/types/ids.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

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
