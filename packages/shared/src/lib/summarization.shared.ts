import {z} from 'zod';

import {ai} from '@shared/lib/ai.shared';
import {asyncTry, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {AsyncResult} from '@shared/types/result.types';

const generateHierarchicalSummaryFlow = ai.defineFlow(
  {
    name: 'generateHierarchicalSummary',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (content: string) => {
    const {text: firstSummary} = await ai.generate(`
      Summarize the following content in a clear, comprehensive way. Focus on the key points, main arguments, and important details:

      ${content}
    `);

    const {text: secondSummary} = await ai.generate(`
      Distill this summary into its core points, organizing them in a clear, hierarchical structure:

      ${firstSummary}
    `);

    const {text: finalSummary} = await ai.generate(`
      Create a final, concise bullet-point summary that captures the absolute essence. Format as:
      • Main point 1
      • Main point 2
      • Key takeaway

      Summary to process:
      ${secondSummary}
    `);

    return finalSummary;
  }
);

export async function generateHierarchicalSummary(content: string): AsyncResult<string> {
  const summaryResult = await asyncTry(async () => generateHierarchicalSummaryFlow(content));
  return prefixResultIfError(summaryResult, 'Error generating hierarchical summary');
}
