import {z} from 'zod';

import {ActorType} from '@shared/types/actors.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';

const UserActorSchema = z.object({
  actorType: z.literal(ActorType.User),
  accountId: AccountIdSchema,
});

/** Type for a {@link UserActor} persisted to Firestore. */
type UserActorFromStorage = z.infer<typeof UserActorSchema>;

const SystemActorSchema = z.object({
  actorType: z.literal(ActorType.System),
});

/** Type for a {@link SystemActor} persisted to Firestore. */
type SystemActorFromStorage = z.infer<typeof SystemActorSchema>;

export const ActorSchema = z.discriminatedUnion('actorType', [UserActorSchema, SystemActorSchema]);

/** Type for an {@link Actor} persisted to Firestore. */
export type ActorFromStorage = UserActorFromStorage | SystemActorFromStorage;
