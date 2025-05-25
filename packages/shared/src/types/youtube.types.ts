/**
 * Strongly-typed identifier for a YouTube channel. Prefer this over plain strings.
 */
export type YouTubeChannelId = string & {readonly __brand: 'YouTubeChannelId'};

/**
 * Strongly-typed identifier for a YouTube handle. Prefer this over plain strings.
 */
export type YouTubeHandle = string & {readonly __brand: 'YouTubeHandle'};

/**
 * Strongly-typed identifier for a YouTube video. Prefer this over plain strings.
 */
export type YouTubeVideoId = string & {readonly __brand: 'YouTubeVideoId'};
