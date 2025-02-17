import {z} from 'zod';

import {AccountIdSchema, type AccountId} from '@shared/types/accounts.types';

export enum ActorType {
  User = 'USER',
  System = 'SYSTEM',
}

interface SystemActor {
  readonly type: ActorType.System;
}

interface UserActor {
  readonly type: ActorType.User;
  readonly accountId: AccountId;
}

export type Actor = UserActor | SystemActor;

export const SYSTEM_ACTOR: SystemActor = {
  type: ActorType.System,
};

export function makeUserActor(accountId: AccountId): UserActor {
  return {
    type: ActorType.User,
    accountId,
  };
}

export const ActorSchema = z
  .object({
    type: z.literal(ActorType.User),
    accountId: AccountIdSchema,
  })
  .or(
    z.object({
      type: z.literal(ActorType.System),
    })
  );
