import {z} from 'zod';

import {ActorType} from '@shared/types/actors.types';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';

const AccountActorSchema = z.object({
  actorType: z.literal(ActorType.Account),
  accountId: AccountIdSchema,
});

/** Type for a {@link AccountActor} persisted to Firestore. */
type AccountActorFromStorage = z.infer<typeof AccountActorSchema>;

const SystemActorSchema = z.object({
  actorType: z.literal(ActorType.System),
});

/** Type for a {@link SystemActor} persisted to Firestore. */
type SystemActorFromStorage = z.infer<typeof SystemActorSchema>;

export const ActorSchema = z.discriminatedUnion('actorType', [
  AccountActorSchema,
  SystemActorSchema,
]);

/** Type for an {@link Actor} persisted to Firestore. */
export type ActorFromStorage = AccountActorFromStorage | SystemActorFromStorage;
