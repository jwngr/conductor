import {z} from 'zod';

import {Environment} from '@shared/types/environment.types';

export const EnvironmentSchema = z.nativeEnum(Environment);
