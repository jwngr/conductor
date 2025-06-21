import {z} from 'zod/v4';

import {EmailAddressSchema} from '@shared/schemas/emails.schema';
import {AccountIdSchema} from '@shared/schemas/ids.schema';
import {BaseStoreItemSchema} from '@shared/schemas/utils.schema';

export const AccountSchema = BaseStoreItemSchema.extend({
  accountId: AccountIdSchema,
  email: EmailAddressSchema,
  displayName: z.string().optional(),
});

/** Type for an {@link Account} persisted to Firestore. */
export type AccountFromStorage = z.infer<typeof AccountSchema>;
