import {z} from 'zod';

export const YouTubeChannelIdSchema = z
  .string()
  .length(24, {message: 'YouTube channel ID must be 24 characters long'})
  .regex(/^UC[A-Za-z0-9_-]{22}$/, {
    message: 'YouTube channel ID must start with "UC" followed by 22 letters, digits, "_" or "-"',
  });

export const YouTubeHandleSchema = z.string().min(1).max(128);

export const YouTubeVideoIdSchema = z
  .string()
  .length(11, {message: 'YouTube video ID must be exactly 11 characters long'})
  .regex(/^[A-Za-z0-9_-]{11}$/, {
    message: 'YouTube video ID must contain only letters, digits, "-", or "_"',
  });
