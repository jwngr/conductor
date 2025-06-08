import {z} from 'zod/v4';

export const ScriptsEnvironmentVariablesSchema = z.object({
  FIREBASE_USER_ID: z.string().min(1),
  FIRECRAWL_API_KEY: z.string().min(1),
});

export interface ScriptsEnvironmentVariables {
  readonly firebaseUserId: string;
  readonly firecrawlApiKey: string;
}
