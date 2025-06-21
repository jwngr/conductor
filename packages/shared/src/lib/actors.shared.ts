import type {AccountActor, SystemActor} from '@shared/types/actors.types';
import {ActorType} from '@shared/types/actors.types';
import type {AccountId} from '@shared/types/ids.types';

export function makeAccountActor(accountId: AccountId): AccountActor {
  return {
    actorType: ActorType.Account,
    accountId,
  };
}

export const SYSTEM_ACTOR: SystemActor = {
  actorType: ActorType.System,
};
