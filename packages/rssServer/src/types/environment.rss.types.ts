import {z} from 'zod/v4';

export const RssServerEnvironmentVariablesSchema = z.object({
  LOCAL_RSS_FEED_PROVIDER_PORT: z.number().min(1000).max(65535),
});

export type RssServerEnvironmentVariables = z.infer<typeof RssServerEnvironmentVariablesSchema>;
