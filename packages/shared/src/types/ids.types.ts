/**
 * This file contains strongly-typed IDs for the major entities in the app. Prefer these over plain
 * strings.
 *
 * These IDs are in a separate file to more easily avoid circular dependencies. Often abstractions
 * need to just know about a typed ID. Since this file does not import anything itself, those files
 * can safely import this file without creating a circular dependency.
 */

/** Strongly-typed type for a UUID. Prefer this over plain strings. */
export type UUID = string & {readonly __brand: 'UUIDBrand'};

/**
 * Strongly-typed type for an {@link Account}'s unique identifier. Prefer this over plain strings.
 */
export type AccountId = string & {readonly __brand: 'AccountIdBrand'};

/**
 * Strongly-typed type for a {@link FeedItem}'s unique identifier. Prefer this over plain strings.
 */
export type FeedItemId = string & {readonly __brand: 'FeedItemIdBrand'};

/**
 * Strongly-typed type for a {@link FeedSubscription}'s unique identifier. Prefer this over
 * plain strings.
 */
export type FeedSubscriptionId = string & {readonly __brand: 'FeedSubscriptionIdBrand'};

/**
 * Strongly-typed type for a {@link UserTag}'s unique identifier. Prefer this over plain strings.
 */
export type UserTagId = string & {readonly __brand: 'UserTagIdBrand'};

/**
 * Strongly-typed type for an {@link EventLogItem}'s unique identifier. Prefer this over plain
 * strings.
 */
export type EventLogItemId = string & {readonly __brand: 'EventLogItemIdBrand'};
