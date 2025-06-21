/**
 * The type of content in a feed item. Some types persist additional data (e.g. XKCD stores the
 * comic number, YouTube stores the video ID).
 */
export enum FeedItemContentType {
  Article = 'ARTICLE',
  Video = 'VIDEO',
  Website = 'WEBSITE',
  Tweet = 'TWEET',
  Xkcd = 'XKCD',
  YouTube = 'YOUTUBE',
  /** Feed items emitted by an interval feed subscription. */
  Interval = 'INTERVAL',
}

interface BaseFeedItemContent {
  readonly feedItemContentType: FeedItemContentType;
  /** Title of the content provided by the source. */
  readonly title: string;
}

interface BaseFeedItemContentWithUrl extends BaseFeedItemContent {
  readonly url: string;
  /** Description of the content provided by the source. */
  readonly description: string | null;
  /** Outgoing links found in the content. */
  readonly outgoingLinks: string[];
  /** AI-generated summary of the content. */
  readonly summary: string | null;
}

export interface ArticleFeedItemContent extends BaseFeedItemContentWithUrl {
  readonly feedItemContentType: FeedItemContentType.Article;
}

export interface VideoFeedItemContent extends BaseFeedItemContentWithUrl {
  readonly feedItemContentType: FeedItemContentType.Video;
}

export interface WebsiteFeedItemContent extends BaseFeedItemContentWithUrl {
  readonly feedItemContentType: FeedItemContentType.Website;
}

export interface TweetFeedItemContent extends BaseFeedItemContentWithUrl {
  readonly feedItemContentType: FeedItemContentType.Tweet;
}

export interface YouTubeFeedItemContent extends BaseFeedItemContentWithUrl {
  readonly feedItemContentType: FeedItemContentType.YouTube;
}

export interface XkcdFeedItemContent extends BaseFeedItemContent {
  readonly feedItemContentType: FeedItemContentType.Xkcd;
  readonly url: string;
  /** AI-generated summary of the XKCD comic. */
  readonly summary: string | null;
  /** Alt text for the comic image. */
  readonly altText: string;
  /** URL of the small version of the comic image. */
  readonly imageUrlSmall: string;
  /** URL of the large version of the comic image. */
  readonly imageUrlLarge: string;
}

export interface IntervalFeedItemContent extends BaseFeedItemContent {
  readonly feedItemContentType: FeedItemContentType.Interval;
  readonly intervalSeconds: number;
}

export type FeedItemContent =
  | ArticleFeedItemContent
  | VideoFeedItemContent
  | WebsiteFeedItemContent
  | TweetFeedItemContent
  | YouTubeFeedItemContent
  | XkcdFeedItemContent
  | IntervalFeedItemContent;
