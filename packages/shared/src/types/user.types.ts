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

export interface LoggedInUser {
  readonly userId: UserId;
  readonly email: EmailAddress;
  readonly displayName: string | null;
  // TODO: Add photo URL.
  // readonly photoUrl: string;
}

export type AuthStateChangedCallback = Consumer<LoggedInUser | null>;

export type AuthStateChangedUnsubscribe = Task;
