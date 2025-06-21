// IDs are in their own file to more easily avoid circular dependencies. Often abstractions need
// to just know about a typed ID.

/**
 * Strongly-typed type for an {@link Account}'s unique identifier. Prefer this over plain strings.
 */
export type AccountId = string & {readonly __brand: 'AccountIdBrand'};

/**
 * Strongly-typed type for a {@link FeedSubscription}'s unique identifier. Prefer this over
 * plain strings.
 */
export type FeedSubscriptionId = string & {readonly __brand: 'FeedSubscriptionIdBrand'};
