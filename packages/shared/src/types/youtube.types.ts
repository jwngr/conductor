import {z} from 'zod';

/**
 * Strongly-typed identifier for a YouTube channel. Prefer this over plain strings.
 */
export type YouTubeChannelId = string & {readonly __brand: 'YouTubeChannelId'};

/**
 * A Zod schema for a {@link YouTubeChannelId}.
 */
export const YouTubeChannelIdSchema = z.string().min(1).max(128);
