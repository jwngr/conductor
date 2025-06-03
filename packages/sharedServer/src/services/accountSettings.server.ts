import {makeDefaultAccountSettings} from '@shared/lib/accountSettings.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {AccountSettings} from '@shared/types/accountSettings.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {ThemePreference} from '@shared/types/theme.types';

import type {AccountSettingsFromStorage} from '@shared/schemas/accountSettings.schema';

import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type AccountSettingsCollectionService = ServerFirestoreCollectionService<
  AccountId,
  AccountSettings,
  AccountSettingsFromStorage
>;

export class ServerAccountSettingsService {
  private readonly accountSettingsCollectionService: AccountSettingsCollectionService;

  constructor(args: {readonly accountSettingsCollectionService: AccountSettingsCollectionService}) {
    this.accountSettingsCollectionService = args.accountSettingsCollectionService;
  }

  public async initializeForAccount(args: {readonly accountId: AccountId}): AsyncResult<void> {
    const {accountId} = args;
    const defaultAccountSettings = makeDefaultAccountSettings({accountId});
    return this.accountSettingsCollectionService.setDoc(accountId, defaultAccountSettings);
  }

  private async updateForAccount(args: {
    readonly accountId: AccountId;
    readonly updates: Partial<AccountSettings>;
  }): AsyncResult<void> {
    const {accountId, updates} = args;
    return this.accountSettingsCollectionService.updateDoc(accountId, updates);
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
    return await this.accountSettingsCollectionService.deleteDoc(accountId);
  }
}
