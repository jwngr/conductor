/** Strongly-typed type for an {@link EmailAddress}. Prefer this over plain strings. */
export type EmailAddress = string & {readonly __brand: 'EmailAddressBrand'};
