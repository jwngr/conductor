import {z} from 'zod/v4';

import {Environment} from '@shared/types/environment.types';

export const EnvironmentSchema = z.enum(Environment);
