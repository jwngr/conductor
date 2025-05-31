import {makeDefaultAccountExperimentsState} from '@shared/lib/experiments.shared';

import type {AccountId} from '@shared/types/accounts.types';
import type {AccountExperimentsState} from '@shared/types/experiments.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {AccountExperimentsStateFromStorage} from '@shared/schemas/experiments.schema';

import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type ServerAccountExperimentsCollectionService = ServerFirestoreCollectionService<
  AccountId,
  AccountExperimentsState,
  AccountExperimentsStateFromStorage
>;

export class ServerExperimentsService {
  private readonly accountExperimentsCollectionService: ServerAccountExperimentsCollectionService;

  constructor(args: {
    readonly accountExperimentsCollectionService: ServerAccountExperimentsCollectionService;
  }) {
    this.accountExperimentsCollectionService = args.accountExperimentsCollectionService;
  }

  public async initializeForAccount(args: {readonly accountId: AccountId}): AsyncResult<void> {
    const {accountId} = args;

    const defaultAccountExperimentsState = makeDefaultAccountExperimentsState({accountId});

    return this.setAccountExperimentsState({
      accountId,
      accountExperimentsState: defaultAccountExperimentsState,
    });
  }

  public async setAccountExperimentsState(args: {
    readonly accountId: AccountId;
    readonly accountExperimentsState: AccountExperimentsState;
  }): AsyncResult<void> {
    const {accountId, accountExperimentsState} = args;
    return this.accountExperimentsCollectionService.setDoc(accountId, accountExperimentsState);
  }
}
