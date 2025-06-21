import type {UserRecord} from 'firebase-admin/auth';
import type {WithFieldValue} from 'firebase-admin/firestore';

import {ACCOUNTS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {asyncTry, asyncTryAll} from '@shared/lib/errorUtils.shared';
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
import {
  serverTimestampSupplier,
  type ServerFirebaseService,
} from '@sharedServer/services/firebase.server';
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
  private readonly firebaseService: ServerFirebaseService;
  private readonly collectionService: AccountsCollectionService;
  private readonly accountSettingsService: ServerAccountSettingsService;
  private readonly experimentsService: ServerExperimentsService;

  constructor(args: {
    readonly firebaseService: ServerFirebaseService;
    readonly accountSettingsService: ServerAccountSettingsService;
    readonly experimentsService: ServerExperimentsService;
  }) {
    this.firebaseService = args.firebaseService;
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

  /**
   * Fetches the accounts doc for the account associated with the provided account ID.
   */
  public async fetchAccountById(accountId: AccountId): AsyncResult<Account | null, Error> {
    return this.collectionService.fetchById(accountId);
  }

  /**
   * Fetches the accounts doc for the account associated with the provided email address.
   */
  public async fetchAccountByEmail(email: EmailAddress): AsyncResult<Account | null, Error> {
    // Fetch the Firebase user from the email address.
    const userResult = await this.fetchFirebaseUserFromEmail(email);
    if (!userResult.success) return userResult;
    const user = userResult.value;

    // If no Firebase user is found, we should not have an account.
    if (!user) return makeSuccessResult(null);

    // Parse the Firebase UID into an account ID.
    const accountIdResult = parseAccountId(user.uid);
    if (!accountIdResult.success) return accountIdResult;
    const accountId = accountIdResult.value;

    // Fetch the accounts doc for the account ID.
    return this.fetchAccountById(accountId);
  }

  /**
   * Adds a new accounts doc to Firestore.
   */
  public async addAccount(args: {
    readonly accountId: AccountId;
    readonly email: EmailAddress;
  }): AsyncResult<void, Error> {
    const {accountId, email} = args;

    const createAccountResult = await asyncTryAll([
      this.createAccountsDoc({accountId, email}),
      this.accountSettingsService.initializeForAccount({accountId}),
      this.experimentsService.initializeForAccount({accountId, email}),
    ]);

    if (!createAccountResult.success) return createAccountResult;

    const firstErrorResult = createAccountResult.value.results.find((result) => !result.success);
    if (firstErrorResult) return firstErrorResult;

    return makeSuccessResult(undefined);
  }

  /**
   * Permanently deletes all account-related documents from Firestore.
   */
  public async deleteAccount(accountId: AccountId): AsyncResult<void, Error> {
    const deleteResult = await asyncTryAll([
      this.deleteAccountsDoc(accountId),
      this.accountSettingsService.deleteForAccount(accountId),
      this.experimentsService.deleteForAccount(accountId),
    ]);

    if (!deleteResult.success) return deleteResult;

    const firstErrorResult = deleteResult.value.results.find((result) => !result.success);
    if (firstErrorResult) return firstErrorResult;

    return makeSuccessResult(undefined);
  }

  private async createAccountsDoc(args: {
    readonly accountId: AccountId;
    readonly email: EmailAddress;
  }): AsyncResult<void, Error> {
    const {accountId, email} = args;

    const account: WithFieldValue<Account> = {
      accountId,
      email,
      createdTime: serverTimestampSupplier(),
      lastUpdatedTime: serverTimestampSupplier(),
    };

    return this.collectionService.setDoc(accountId, account);
  }

  /**
   * Permanently deletes the `/accounts/$accountId` document from Firestore.
   */
  private async deleteAccountsDoc(accountId: AccountId): AsyncResult<void, Error> {
    return this.collectionService.deleteDoc(accountId);
  }

  /**
   * Fetches the Firebase user for the account associated with the provided email address.
   */
  private async fetchFirebaseUserFromEmail(
    email: EmailAddress
  ): AsyncResult<UserRecord | null, Error> {
    return await asyncTry(async () => this.firebaseService.auth.getUserByEmail(email));
  }
}
