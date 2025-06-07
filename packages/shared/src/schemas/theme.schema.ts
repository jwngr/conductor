import {z} from 'zod/v4';

import {ThemePreference} from '@shared/types/theme.types';

export const ThemePreferenceSchema = z.enum(ThemePreference);
