import {z} from 'zod';

import {RendererType} from '@shared/types/renderers.types';

export enum StoriesSidebarSectionId {
  AtomicComponents = 'ATOMIC_COMPONENTS',
  DesignSystem = 'DESIGN_SYSTEM',
  Renderers = 'RENDERERS',
}

export enum AtomicComponentType {
  Badge = 'BADGE',
  Button = 'BUTTON',
  ButtonIcon = 'BUTTON_ICON',
  Checkbox = 'CHECKBOX',
  Dialog = 'DIALOG',
  Divider = 'DIVIDER',
  Flex = 'FLEX',
  Input = 'INPUT',
  Link = 'LINK',
  Spacer = 'SPACER',
  Text = 'TEXT',
  TextIcon = 'TEXT_ICON',
  Toast = 'TOAST',
  Tooltip = 'TOOLTIP',
}

export enum DesignSystemComponentType {
  Typography = 'TYPOGRAPHY',
  Colors = 'COLORS',
  ColorsVanilla = 'COLORS_VANILLA',
  Icons = 'ICONS',
}

export interface AtomicComponentSidebarItem {
  readonly sidebarSectionId: StoriesSidebarSectionId.AtomicComponents;
  readonly sidebarItemId: AtomicComponentType;
  readonly title: string;
}

export interface DesignSystemSidebarItem {
  readonly sidebarSectionId: StoriesSidebarSectionId.DesignSystem;
  readonly sidebarItemId: DesignSystemComponentType;
  readonly title: string;
}

export interface RendererSidebarItem {
  readonly sidebarSectionId: StoriesSidebarSectionId.Renderers;
  readonly sidebarItemId: RendererType;
  readonly title: string;
}

export type StoriesSidebarItemId = AtomicComponentType | DesignSystemComponentType | RendererType;

export type StoriesSidebarItem =
  | AtomicComponentSidebarItem
  | DesignSystemSidebarItem
  | RendererSidebarItem;

/**
 * Zod schema for a {@link StoriesSidebarItemId}.
 */
export const StoriesSidebarItemIdSchema = z.union([
  z.nativeEnum(AtomicComponentType),
  z.nativeEnum(DesignSystemComponentType),
  z.nativeEnum(RendererType),
]);
