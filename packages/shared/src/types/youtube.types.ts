import {z} from 'zod';

/**
 * Strongly-typed identifier for a YouTube channel. Prefer this over plain strings.
 */
export type YouTubeChannelId = string & {readonly __brand: 'YouTubeChannelId'};

/**
 * A Zod schema for a {@link YouTubeChannelId}.
 */
export const YouTubeChannelIdSchema = z
  .string()
  .length(24, {message: 'YouTube channel ID must be 24 characters long'})
  .regex(/^UC[A-Za-z0-9_-]{22}$/, {
    message: 'YouTube channel ID must start with "UC" followed by 22 letters, digits, "_" or "-"',
  });

/**
 * Strongly-typed identifier for a YouTube handle. Prefer this over plain strings.
 */
export type YouTubeHandle = string & {readonly __brand: 'YouTubeHandle'};

/**
 * A Zod schema for a {@link YouTubeHandle}.
 */
export const YouTubeHandleSchema = z.string().min(1).max(128);

/**
 * Strongly-typed identifier for a YouTube video. Prefer this over plain strings.
 */
export type YouTubeVideoId = string & {readonly __brand: 'YouTubeVideoId'};

export const YouTubeVideoIdSchema = z
  .string()
  .length(11, {message: 'YouTube video ID must be exactly 11 characters long'})
  .regex(/^[A-Za-z0-9_-]{11}$/, {
    message: 'YouTube video ID must contain only letters, digits, "-", or "_"',
  });
