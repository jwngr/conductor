import {makeDefaultAccountSettings} from '@shared/lib/accountSettings.shared';
import {ACCOUNT_SETTINGS_DB_COLLECTION} from '@shared/lib/constants.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseAccountSettings} from '@shared/parsers/accountSettings.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {AccountSettings} from '@shared/types/accountSettings.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {ThemePreference} from '@shared/types/theme.types';

import type {AccountSettingsFromStorage} from '@shared/schemas/accountSettings.schema';
import {toStorageAccountSettings} from '@shared/storage/accountSettings.storage';

import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';
import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';
import {makeServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type ServerAccountSettingsCollectionService = ServerFirestoreCollectionService<
  AccountId,
  AccountSettings,
  AccountSettingsFromStorage
>;

export class ServerAccountSettingsService {
  private readonly collectionService: ServerAccountSettingsCollectionService;

  constructor(args: {readonly firebaseService: ServerFirebaseService}) {
    this.collectionService = makeServerFirestoreCollectionService({
      firebaseService: args.firebaseService,
      collectionPath: ACCOUNT_SETTINGS_DB_COLLECTION,
      parseId: parseAccountId,
      toStorage: toStorageAccountSettings,
      fromStorage: parseAccountSettings,
    });
  }

  public async initializeForAccount(args: {
    readonly accountId: AccountId;
  }): AsyncResult<void, Error> {
    const {accountId} = args;
    const defaultAccountSettings = makeDefaultAccountSettings({accountId});
    return this.collectionService.setDoc(accountId, defaultAccountSettings);
  }

  private async updateForAccount(args: {
    readonly accountId: AccountId;
    readonly updates: Partial<AccountSettings>;
  }): AsyncResult<void, Error> {
    const {accountId, updates} = args;
    return this.collectionService.updateDoc(accountId, updates);
  }

  public async updateThemePreference(args: {
    readonly accountId: AccountId;
    readonly themePreference: ThemePreference;
  }): AsyncResult<void, Error> {
    const {accountId, themePreference} = args;
    return this.updateForAccount({accountId, updates: {themePreference}});
  }

  /**
   * Permanently deletes all account settings documents associated with an account.
   */
  public async deleteForAccount(accountId: AccountId): AsyncResult<void, Error> {
    return await this.collectionService.deleteDoc(accountId);
  }
}
