import {z} from 'zod';

import {ThemePreference} from '@shared/types/theme.types';

export const ThemePreferenceSchema = z.nativeEnum(ThemePreference);
