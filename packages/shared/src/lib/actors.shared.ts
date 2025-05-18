import type {AccountId} from '@shared/types/accounts.types';
import type {SystemActor, UserActor} from '@shared/types/actors.types';
import {ActorType} from '@shared/types/actors.types';

export function makeUserActor(accountId: AccountId): UserActor {
  return {
    actorType: ActorType.User,
    accountId,
  };
}

export const SYSTEM_ACTOR: SystemActor = {
  actorType: ActorType.System,
};
