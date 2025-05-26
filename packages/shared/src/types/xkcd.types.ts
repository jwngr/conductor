export interface XkcdComic {
  readonly title: string;
  readonly altText: string;
  readonly imageUrlSmall: string;
  readonly imageUrlLarge: string;
}

export interface ExplainXkcdContent {
  readonly explanationMarkdown: string;
  readonly transcriptMarkdown: string | null;
}
