import {YoutubeTranscript} from 'youtube-transcript';

import {asyncTry} from '@shared/lib/errorUtils.shared';
import {makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult} from '@shared/types/results.types';

export async function fetchYouTubeTranscript(url: string): AsyncResult<string> {
  const fetchTranscriptResult = await asyncTry(async () =>
    YoutubeTranscript.fetchTranscript(url, {
      lang: 'en',
    })
  );
  if (!fetchTranscriptResult.success) return fetchTranscriptResult;

  const segments = fetchTranscriptResult.value;
  const content = segments.map((s) => s.text).join('\n\n');

  return makeSuccessResult(content);
}
