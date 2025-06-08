import type {AccountId} from '@shared/types/accounts.types';

export enum ActorType {
  Account = 'ACCOUNT',
  System = 'SYSTEM',
}

export interface SystemActor {
  readonly actorType: ActorType.System;
}

export interface AccountActor {
  readonly actorType: ActorType.Account;
  readonly accountId: AccountId;
}

export type Actor = AccountActor | SystemActor;
