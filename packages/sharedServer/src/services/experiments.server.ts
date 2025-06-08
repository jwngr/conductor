import {isInternalAccount} from '@shared/lib/accounts.shared';
import {ACCOUNT_EXPERIMENTS_DB_COLLECTION} from '@shared/lib/constants.shared';
import {makeDefaultAccountExperimentsState} from '@shared/lib/experiments.shared';

import {parseAccountId} from '@shared/parsers/accounts.parser';
import {parseAccountExperimentsState} from '@shared/parsers/experiments.parser';

import type {AccountId} from '@shared/types/accounts.types';
import type {EmailAddress} from '@shared/types/emails.types';
import type {AccountExperimentsState} from '@shared/types/experiments.types';
import type {AsyncResult} from '@shared/types/results.types';

import type {AccountExperimentsStateFromStorage} from '@shared/schemas/experiments.schema';
import {toStorageAccountExperimentsState} from '@shared/storage/experiments.storage';

import type {ServerFirebaseService} from '@sharedServer/services/firebase.server';
import {makeServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';
import type {ServerFirestoreCollectionService} from '@sharedServer/services/firestore.server';

type ServerAccountExperimentsCollectionService = ServerFirestoreCollectionService<
  AccountId,
  AccountExperimentsState,
  AccountExperimentsStateFromStorage
>;

export class ServerExperimentsService {
  private readonly collectionService: ServerAccountExperimentsCollectionService;

  constructor(args: {readonly firebaseService: ServerFirebaseService}) {
    this.collectionService = makeServerFirestoreCollectionService({
      firebaseService: args.firebaseService,
      collectionPath: ACCOUNT_EXPERIMENTS_DB_COLLECTION,
      parseId: parseAccountId,
      toStorage: toStorageAccountExperimentsState,
      fromStorage: parseAccountExperimentsState,
    });
  }

  public async initializeForAccount(args: {
    readonly accountId: AccountId;
    readonly email: EmailAddress;
  }): AsyncResult<void, Error> {
    const {accountId, email} = args;

    const defaultAccountExperimentsState = makeDefaultAccountExperimentsState({
      accountId,
      isInternalAccount: isInternalAccount({email}),
    });

    return this.setAccountExperimentsState({
      accountId,
      accountExperimentsState: defaultAccountExperimentsState,
    });
  }

  public async setAccountExperimentsState(args: {
    readonly accountId: AccountId;
    readonly accountExperimentsState: AccountExperimentsState;
  }): AsyncResult<void, Error> {
    const {accountId, accountExperimentsState} = args;
    return this.collectionService.setDoc(accountId, accountExperimentsState);
  }

  public async deleteForAccount(accountId: AccountId): AsyncResult<void, Error> {
    return this.collectionService.deleteDoc(accountId);
  }
}
