import {z} from 'zod';

import {RssFeedProviderType} from '@shared/types/rss.types';

export const RssFeedProviderTypeSchema = z.nativeEnum(RssFeedProviderType);
