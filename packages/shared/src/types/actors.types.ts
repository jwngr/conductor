import {z} from 'zod';

import {AccountIdSchema, type AccountId} from '@shared/types/accounts.types';

export enum ActorType {
  User = 'USER',
  System = 'SYSTEM',
}

interface SystemActor {
  readonly actorType: ActorType.System;
}

interface UserActor {
  readonly actorType: ActorType.User;
  readonly accountId: AccountId;
}

export type Actor = UserActor | SystemActor;

export const SYSTEM_ACTOR: SystemActor = {
  actorType: ActorType.System,
};

export function makeUserActor(accountId: AccountId): UserActor {
  return {
    actorType: ActorType.User,
    accountId,
  };
}

export const ActorSchema = z
  .object({
    actorType: z.literal(ActorType.User),
    accountId: AccountIdSchema,
  })
  .or(
    z.object({
      actorType: z.literal(ActorType.System),
    })
  );
