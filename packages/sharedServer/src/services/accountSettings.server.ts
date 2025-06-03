import {makeDefaultAccountSettings} from '@shared/lib/accountSettings.shared';
import {ACCOUNT_SETTINGS_DB_COLLECTION} from '@shared/lib/constants.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {
  parseAccountSettings,
  toStorageAccountSettings,
} from '@shared/parsers/accountSettings.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {AccountSettings} from '@shared/types/accountSettings.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {ThemePreference} from '@shared/types/theme.types';

import {makeServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

const accountSettingsCollectionService = makeServerFirestoreCollectionService({
  collectionPath: ACCOUNT_SETTINGS_DB_COLLECTION,
  parseId: parseAccountId,
  toStorage: toStorageAccountSettings,
  fromStorage: parseAccountSettings,
});

export class ServerAccountSettingsService {
  public async initializeForAccount(args: {readonly accountId: AccountId}): AsyncResult<void> {
    const {accountId} = args;
    const defaultAccountSettings = makeDefaultAccountSettings({accountId});
    return accountSettingsCollectionService.setDoc(accountId, defaultAccountSettings);
  }

  private async updateForAccount(args: {
    readonly accountId: AccountId;
    readonly updates: Partial<AccountSettings>;
  }): AsyncResult<void> {
    const {accountId, updates} = args;
    return accountSettingsCollectionService.updateDoc(accountId, updates);
  }

  public async updateThemePreference(args: {
    readonly accountId: AccountId;
    readonly themePreference: ThemePreference;
  }): AsyncResult<void> {
    const {accountId, themePreference} = args;
    return this.updateForAccount({accountId, updates: {themePreference}});
  }

  /**
   * Permanently deletes all account settings documents associated with an account.
   */
  public async deleteForAccount(accountId: AccountId): AsyncResult<void> {
    return await accountSettingsCollectionService.deleteDoc(accountId);
  }
}
