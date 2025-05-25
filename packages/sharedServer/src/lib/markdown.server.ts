import TurndownService from 'turndown';

const turndownService = new TurndownService();

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html).trim();
}
