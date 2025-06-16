// Firestore collections.
export const EVENT_LOG_DB_COLLECTION = 'eventLog';
export const FEED_ITEMS_DB_COLLECTION = 'feedItems';
export const USER_FEED_SUBSCRIPTIONS_DB_COLLECTION = 'userFeedSubscriptions';
export const ACCOUNTS_DB_COLLECTION = 'accounts';
export const ACCOUNT_EXPERIMENTS_DB_COLLECTION = 'accountExperiments';
export const ACCOUNT_SETTINGS_DB_COLLECTION = 'accountSettings';

// Firebase Cloud Storage collections.
export const FEED_ITEMS_STORAGE_COLLECTION = 'feedItems';

// Feed item file names.
export const FEED_ITEM_FILE_HTML = 'sanitized.html';
export const FEED_ITEM_FILE_HTML_DEFUDDLE = 'defuddle.html';
export const FEED_ITEM_FILE_HTML_MARKDOWN = 'defuddle.md';
export const FEED_ITEM_FILE_LLM_CONTEXT = 'llmContext.md';
export const FEED_ITEM_FILE_TRANSCRIPT = 'transcript.md';
export const FEED_ITEM_FILE_XKCD_EXPLAIN = 'xkcdExplain.md';

// Time.
export const MILLIS_PER_HOUR = 1000 * 60 * 60;

// Object constants to avoid creating new objects.
export const EMPTY_ARRAY = [] as const;
export const EMPTY_OBJECT = Object.freeze({});

// Miscellaneous.
export const DEFAULT_FEED_TITLE = '(no title)';
