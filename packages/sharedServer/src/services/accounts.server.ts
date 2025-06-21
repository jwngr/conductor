import {ACCOUNTS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {asyncTryAll} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import {parseAccount, parseAccountId} from '@shared/parsers/accounts.parser';

import type {Account} from '@shared/types/accounts.types';
import type {EmailAddress} from '@shared/types/emails.types';
import type {AccountId} from '@shared/types/ids.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {AccountFromStorage} from '@shared/schemas/accounts.schema';
import {toStorageAccount} from '@shared/storage/accounts.storage';

import type {ServerAccountSettingsService} from '@sharedServer/services/accountSettings.server';
import type {ServerExperimentsService} from '@sharedServer/services/experiments.server';
import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';
import {
  makeServerFirestoreCollectionService,
  type ServerFirestoreCollectionService,
} from '@sharedServer/services/firestore.server';

type AccountsCollectionService = ServerFirestoreCollectionService<
  AccountId,
  Account,
  AccountFromStorage
>;

export class ServerAccountsService {
  private readonly collectionService: AccountsCollectionService;
  private readonly accountSettingsService: ServerAccountSettingsService;
  private readonly experimentsService: ServerExperimentsService;

  constructor(args: {
    readonly firebaseService: ServerFirebaseService;
    readonly accountSettingsService: ServerAccountSettingsService;
    readonly experimentsService: ServerExperimentsService;
  }) {
    this.accountSettingsService = args.accountSettingsService;
    this.experimentsService = args.experimentsService;
    this.collectionService = makeServerFirestoreCollectionService({
      firebaseService: args.firebaseService,
      collectionPath: ACCOUNTS_DB_COLLECTION,
      toStorage: toStorageAccount,
      fromStorage: parseAccount,
      parseId: parseAccountId,
    });
  }

  private async createAccountsDoc(args: {
    readonly accountId: AccountId;
    readonly email: EmailAddress;
  }): AsyncResult<void, Error> {
    const {accountId, email} = args;

    const account = {
      accountId,
      email,
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    };

    return this.collectionService.setDoc(accountId, account);
  }

  public async createAccount(args: {
    readonly accountId: AccountId;
    readonly email: EmailAddress;
  }): AsyncResult<void, Error> {
    const {accountId, email} = args;

    const createAccountResult = await asyncTryAll([
      this.createAccountsDoc({accountId, email}),
      this.accountSettingsService.initializeForAccount({accountId}),
      this.experimentsService.initializeForAccount({accountId, email}),
    ]);

    if (!createAccountResult.success) {
      return createAccountResult;
    }

    const firstErrorResult = createAccountResult.value.results.find((result) => !result.success);
    if (firstErrorResult) {
      return firstErrorResult;
    }

    return makeSuccessResult(undefined);
  }

  /**
   * Permanently deletes all account-related documents from Firestore.
   */
  public async deleteAccount(accountId: AccountId): AsyncResult<void, Error> {
    const deleteResult = await asyncTryAll([
      this.deleteAccountDoc(accountId),
      this.accountSettingsService.deleteForAccount(accountId),
      this.experimentsService.deleteForAccount(accountId),
    ]);

    if (!deleteResult.success) {
      return deleteResult;
    }

    const firstErrorResult = deleteResult.value.results.find((result) => !result.success);
    if (firstErrorResult) {
      return firstErrorResult;
    }

    return makeSuccessResult(undefined);
  }

  /**
   * Permanently deletes the `/accounts/$accountId` document from Firestore.
   */
  private async deleteAccountDoc(accountId: AccountId): AsyncResult<void, Error> {
    return this.collectionService.deleteDoc(accountId);
  }
}
