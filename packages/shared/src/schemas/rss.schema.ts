import {z} from 'zod/v4';

import {RssFeedProviderType} from '@shared/types/rss.types';

export const RssFeedProviderTypeSchema = z.enum(RssFeedProviderType);
