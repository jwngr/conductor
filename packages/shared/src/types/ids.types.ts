/**
 * This file contains strongly-typed IDs for the major entities in the app. Prefer these over plain
 * strings.
 *
 * These IDs are in a separate file to more easily avoid circular dependencies. Often abstractions
 * need to just know about a typed ID. Since this file does not import anything itself, those files
 * can safely import this file without creating a circular dependency.
 *
 * TODO: Consider defining these IDs based on Zod schemas instead of manually keeping them in sync.
 */

/**
 * A strongly-typed unique identifier for a UUID.
 */
export type UUID = string & {readonly __brand: 'UUIDBrand'};

/**
 * A strongly-typed unique identifier for an {@link Account}.
 */
export type AccountId = string & {readonly __brand: 'AccountIdBrand'};

/**
 * A strongly-typed unique identifier for a {@link FeedItem}.
 */
export type FeedItemId = string & {readonly __brand: 'FeedItemIdBrand'};

/**
 * A strongly-typed unique identifier for a {@link FeedSubscription}.
 */
export type FeedSubscriptionId = string & {readonly __brand: 'FeedSubscriptionIdBrand'};

/**
 * A strongly-typed unique identifier for a {@link UserTag}.
 */
export type UserTagId = string & {readonly __brand: 'UserTagIdBrand'};

/**
 * A strongly-typed unique identifier for an {@link EventLogItem}.
 */
export type EventLogItemId = string & {readonly __brand: 'EventLogItemIdBrand'};
