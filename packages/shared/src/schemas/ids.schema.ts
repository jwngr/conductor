import z from 'zod/v4';

export const AccountIdSchema = z.string().min(1).max(128);

export const FeedItemIdSchema = z.uuid();

export const FeedSubscriptionIdSchema = z.uuid();

export const UserTagIdSchema = z.uuid();

export const EventLogItemIdSchema = z.uuid();
