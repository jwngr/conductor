import {z} from 'zod';

export const RssFeedProviderTypeSchema = z.union([z.literal('local'), z.literal('superfeedr')]);
