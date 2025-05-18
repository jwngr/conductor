import {z} from 'zod';

import {EmailAddressSchema} from '@shared/schemas/emails.schema';

/** A Zod schema for a {@link AccountId}. */
export const AccountIdSchema = z.string().min(1).max(128);

/** A Zod schema for an {@link Account} persisted to Firestore. */
export const AccountSchema = z.object({
  accountId: AccountIdSchema,
  email: EmailAddressSchema,
  displayName: z.string().optional(),
});

/** Type for a {@link Account} persisted to Firestore. */
export type AccountFromStorage = z.infer<typeof AccountSchema>;
