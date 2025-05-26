import type {AccountId} from '@shared/types/accounts.types';

export enum ActorType {
  User = 'USER',
  System = 'SYSTEM',
}

export interface SystemActor {
  readonly actorType: ActorType.System;
}

export interface UserActor {
  readonly actorType: ActorType.User;
  readonly accountId: AccountId;
}

export type Actor = UserActor | SystemActor;
