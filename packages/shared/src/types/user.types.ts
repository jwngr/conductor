import {z} from 'zod';

import type {Consumer, Task} from '@shared/types/utils.types';

/**
 * Strongly-typed type for a {@link LoggedInUser}'s unique identifier. Prefer this over plain
 * strings.
 */
export type UserId = string & {readonly __brand: 'UserIdBrand'};

/**
 * A Zod schema for a {@link UserId}.
 */
export const UserIdSchema = z.string().min(1).max(128);

/**
 * Strongly-typed type for an {@link EmailAddress}. Prefer this over plain strings.
 */
export type EmailAddress = string & {readonly __brand: 'EmailAddressBrand'};

/**
 * A Zod schema for an {@link EmailAddress}.
 */
export const EmailAddressSchema = z.string().email();

// TODO: Consider renaming to `User` or introducing a separate, more generic `User` type.
export interface LoggedInUser {
  readonly userId: UserId;
  readonly email: EmailAddress;
  readonly displayName: string | null;
  // TODO: Add photo URL.
  // readonly photoUrl: string;
}

/**
 * A Zod schema for a {@link LoggedInUser}.
 */
export const UserSchema = z.object({
  userId: UserIdSchema,
  email: EmailAddressSchema,
  displayName: z.string().nullable(),
});

export type AuthStateChangedCallback = Consumer<LoggedInUser | null>;

export type AuthStateChangedUnsubscribe = Task;
