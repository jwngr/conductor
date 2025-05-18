import {z} from 'zod';

import {RendererType} from '@shared/types/renderers.types';
import {AtomicComponentType, DesignSystemComponentType} from '@shared/types/stories.types';

/**
 * Zod schema for a {@link StoriesSidebarItemId}. Used to parse a sidebar item ID from the URL.
 */
export const StoriesSidebarItemIdSchema = z.union([
  z.nativeEnum(AtomicComponentType),
  z.nativeEnum(DesignSystemComponentType),
  z.nativeEnum(RendererType),
]);
