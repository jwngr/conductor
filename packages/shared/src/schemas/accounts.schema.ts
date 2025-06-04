import {z} from 'zod';

import {EmailAddressSchema} from '@shared/schemas/emails.schema';

export const AccountIdSchema = z.string().min(1).max(128);

export const AccountSchema = z.object({
  accountId: AccountIdSchema,
  email: EmailAddressSchema,
  displayName: z.string().optional(),
});

/** Type for an {@link Account} persisted to Firestore. */
export type AccountFromStorage = z.infer<typeof AccountSchema>;
