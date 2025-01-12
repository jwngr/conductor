import {z} from 'zod';

import {prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {parseZodResult} from '@shared/lib/parser.shared';

import type {Result} from '@shared/types/result.types';

const SuperfeedrActorSchema = z.object({
  displayName: z.string(),
  id: z.string(),
});

const SuperfeedrStandardLinkSchema = z.object({
  title: z.string(),
  href: z.string(),
  rel: z.string(),
  type: z.string().optional(),
});

const SuperfeedrFeedSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  updated: z.number(),
  published: z.number(),
  permalinkUrl: z.string(),
  standardLinks: z.object({
    alternate: z.array(SuperfeedrStandardLinkSchema),
    superfeedr: z.array(SuperfeedrStandardLinkSchema),
  }),
});

const SuperfeedrFeedItemSchema = z.object({
  id: z.string(),
  published: z.number(),
  updated: z.number(),
  title: z.string(),
  summary: z.string(),
  permalinkUrl: z.string(),
  standardLinks: z.object({
    alternate: z.array(SuperfeedrStandardLinkSchema),
  }),
  actor: SuperfeedrActorSchema,
  source: SuperfeedrFeedSourceSchema,
});

const SuperfeedWebhookRequestBodySchema = z.object({
  status: z.object({
    code: z.number(),
    http: z.string(),
    nextFetch: z.number(),
    velocity: z.number(),
    bozoRank: z.number(),
    title: z.string(),
    period: z.number(),
    lastFetch: z.number(),
    lastParse: z.number(),
    lastMaintenanceAt: z.number(),
    feed: z.string(),
  }),
  title: z.string(),
  updated: z.number().nullable(),
  id: z.string(),
  items: z.array(SuperfeedrFeedItemSchema),
});

const SuperfeedWebhookRequestSchema = z.object({
  body: SuperfeedWebhookRequestBodySchema,
});

type SuperfeedWebhookRequest = z.infer<typeof SuperfeedWebhookRequestSchema>;

export function parseSuperfeedrWebhookRequest(
  maybeRequest: unknown
): Result<SuperfeedWebhookRequest> {
  const parsedResult = parseZodResult(SuperfeedWebhookRequestSchema, maybeRequest);
  return prefixResultIfError(parsedResult, 'Unexpected Superfeedr webhook request');
}
