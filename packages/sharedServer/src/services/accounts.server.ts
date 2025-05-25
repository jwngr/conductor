import type {Account, AccountId} from '@shared/types/accounts.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {AccountFromStorage} from '@shared/schemas/accounts.schema';

import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type AccountsCollectionService = ServerFirestoreCollectionService<
  AccountId,
  Account,
  AccountFromStorage
>;

export class ServerAccountsService {
  private readonly accountsCollectionService: AccountsCollectionService;

  constructor(args: {readonly accountsCollectionService: AccountsCollectionService}) {
    this.accountsCollectionService = args.accountsCollectionService;
  }

  /**
   * Permanently deletes an account document from Firestore.
   */
  public async deleteAccountDoc(accountId: AccountId): AsyncResult<void> {
    return this.accountsCollectionService.deleteDoc(accountId);
  }
}
