import type {AccountId} from '@shared/types/accounts.types';
import type {ThemePreference} from '@shared/types/theme.types';
import type {BaseStoreItem} from '@shared/types/utils.types';

/**
 * Settings associated with an {@link Account}.
 */
export interface AccountSettings extends BaseStoreItem {
  /** ID of the {@link Account} that owns these settings. */
  readonly accountId: AccountId;
  /** User's preferred color theme. */
  readonly themePreference: ThemePreference;
}
