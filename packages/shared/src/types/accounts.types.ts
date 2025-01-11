import {z} from 'zod';

import type {Consumer, EmailAddress, Task} from '@shared/types/utils.types';
import {EmailAddressSchema} from '@shared/types/utils.types';

/**
 * Strongly-typed type for an {@link Account}'s unique identifier. Prefer this over plain strings.
 */
export type AccountId = string & {readonly __brand: 'AccountIdBrand'};

/**
 * A Zod schema for a {@link AccountId}.
 */
export const AccountIdSchema = z.string().min(1).max(128);

/**
 * A generic type representing an account.
 */
export interface Account {
  readonly accountId: AccountId;
  readonly email: EmailAddress;
  readonly displayName?: string;
  // TODO: Add photo URL.
  // readonly photoUrl: string;
}

/**
 * A Zod schema for an {@link Account} persisted to Firestore.
 */
export const AccountFromStorageSchema = z.object({
  accountId: AccountIdSchema,
  email: EmailAddressSchema,
  displayName: z.string().optional(),
});

/**
 * Type for a {@link Account} persisted to Firestore.
 */
export type AccountFromStorage = z.infer<typeof AccountFromStorageSchema>;

export type AuthStateChangedCallback = Consumer<Account | null>;

export type AuthStateChangedUnsubscribe = Task;
