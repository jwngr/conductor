export enum RSSItemType {
  Article = 'ARTICLE',
  Video = 'VIDEO',
  Image = 'IMAGE',
}

export interface RSSFeed {
  // Channel elements
  readonly title: string;
  readonly link: string;
  readonly description: string;
  readonly language?: string;
  readonly copyright?: string;
  readonly managingEditor?: string;
  readonly webMaster?: string;
  readonly pubDate?: string;
  readonly lastBuildDate?: string;
  readonly category?: string | string[];
  readonly generator?: string;
  readonly docs?: string;
  readonly ttl?: number;
  readonly rating?: string;
  readonly skipHours?: number[];
  readonly skipDays?: string[];
}
