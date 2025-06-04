import {z} from 'zod';

import {RendererType} from '@shared/types/renderers.types';
import {
  AtomicComponentType,
  DesignSystemComponentType,
  MoleculeComponentType,
} from '@shared/types/stories.types';

export const StoriesSidebarItemIdSchema = z.union([
  z.nativeEnum(AtomicComponentType),
  z.nativeEnum(DesignSystemComponentType),
  z.nativeEnum(RendererType),
  z.nativeEnum(MoleculeComponentType),
]);
