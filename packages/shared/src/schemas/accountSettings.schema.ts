import {z} from 'zod';

import {AccountIdSchema} from '@shared/schemas/accounts.schema';
import {FirestoreTimestampSchema} from '@shared/schemas/firebase.schema';
import {ThemePreferenceSchema} from '@shared/schemas/theme.schema';

/**
 * Zod schema for {@link AccountSettings} persisted to Firestore.
 */
export const AccountSettingsSchema = z.object({
  accountId: AccountIdSchema,
  themePreference: ThemePreferenceSchema,
  createdTime: FirestoreTimestampSchema.or(z.date()),
  lastUpdatedTime: FirestoreTimestampSchema.or(z.date()),
});

/**
 * Type for {@link AccountSettings} persisted to Firestore.
 */
export type AccountSettingsFromStorage = z.infer<typeof AccountSettingsSchema>;
