import type {z} from 'zod/v4';

import {AccountIdSchema} from '@shared/schemas/ids.schema';
import {ThemePreferenceSchema} from '@shared/schemas/theme.schema';
import {BaseStoreItemSchema} from '@shared/schemas/utils.schema';

export const AccountSettingsSchema = BaseStoreItemSchema.extend({
  accountId: AccountIdSchema,
  themePreference: ThemePreferenceSchema,
});

/** Type for an {@link AccountSettings} persisted to Firestore. */
export type AccountSettingsFromStorage = z.infer<typeof AccountSettingsSchema>;
