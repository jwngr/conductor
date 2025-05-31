import {z} from 'zod';

import {Environment} from '@shared/types/environment.types';

/** Zod schema for an {@link Environment}. */
export const EnvironmentSchema = z.nativeEnum(Environment);
