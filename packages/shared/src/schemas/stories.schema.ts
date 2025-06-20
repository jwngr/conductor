import {z} from 'zod/v4';

import {RendererType} from '@shared/types/renderers.types';
import {
  AtomicComponentType,
  DesignSystemComponentType,
  MoleculeComponentType,
} from '@shared/types/stories.types';

export const StoriesSidebarItemIdSchema = z.union([
  z.enum(AtomicComponentType),
  z.enum(DesignSystemComponentType),
  z.enum(RendererType),
  z.enum(MoleculeComponentType),
]);
