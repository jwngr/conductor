import TurndownService from 'turndown';

import {syncTry} from '@shared/lib/errorUtils.shared';

const turndownService = new TurndownService();

export function htmlToMarkdown(html: string): Result<string> {
  return syncTry(() => turndownService.turndown(html).trim());
}
