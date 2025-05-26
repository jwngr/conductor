export interface RawFirecrawlResponse {
  readonly metadata: {
    readonly title: string | null;
    readonly description: string | null;
  };
  readonly markdown: string | null;
  readonly links: string[] | null;
}

export interface ParsedFirecrawlData {
  readonly title: string | undefined;
  readonly description: string | undefined;
  readonly markdown: string;
  readonly links: string[];
}
