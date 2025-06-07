import TurndownService from 'turndown';

import {syncTry} from '@shared/lib/errorUtils.shared';

import type {Result} from '@shared/types/results.types';

const turndownService = new TurndownService();

export function htmlToMarkdown(html: string): Result<string, Error> {
  return syncTry(() => turndownService.turndown(html).trim());
}
