import {asyncTryAll} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {Account, AccountId} from '@shared/types/accounts.types';
import type {EmailAddress} from '@shared/types/emails.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {AccountFromStorage} from '@shared/schemas/accounts.schema';

import type {ServerExperimentsService} from '@sharedServer/services/experiments.server';
import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type AccountsCollectionService = ServerFirestoreCollectionService<
  AccountId,
  Account,
  AccountFromStorage
>;

export class ServerAccountsService {
  private readonly accountsCollectionService: AccountsCollectionService;
  private readonly experimentsService: ServerExperimentsService;

  constructor(args: {
    readonly accountsCollectionService: AccountsCollectionService;
    readonly experimentsService: ServerExperimentsService;
  }) {
    this.accountsCollectionService = args.accountsCollectionService;
    this.experimentsService = args.experimentsService;
  }

  private async createAccountsDoc(args: {
    readonly accountId: AccountId;
    readonly email: EmailAddress;
  }): AsyncResult<void> {
    const {accountId, email} = args;

    const account = {
      accountId,
      email,
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    };

    return this.accountsCollectionService.setDoc(accountId, account);
  }

  public async createAccount(args: {
    readonly accountId: AccountId;
    readonly email: EmailAddress;
  }): AsyncResult<void> {
    const {accountId, email} = args;

    const createAccountResult = await asyncTryAll([
      this.createAccountsDoc({accountId, email}),
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
   * Permanently deletes an account document from Firestore.
   */
  public async deleteAccountDoc(accountId: AccountId): AsyncResult<void> {
    return this.accountsCollectionService.deleteDoc(accountId);
  }
}
