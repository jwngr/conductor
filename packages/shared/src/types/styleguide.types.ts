import type {RendererType} from '@shared/types/renderers.types';

export enum StoriesSidebarSectionId {
  AtomicComponents = 'ATOMIC_COMPONENTS',
  DesignSystem = 'DESIGN_SYSTEM',
  Renderers = 'RENDERERS',
}

export enum AtomicComponentType {
  Button = 'BUTTON',
  ButtonIcon = 'BUTTON_ICON',
  Dialog = 'DIALOG',
  Divider = 'DIVIDER',
  Flex = 'FLEX',
  Input = 'INPUT',
  Link = 'LINK',
  Spacer = 'SPACER',
  TextIcon = 'TEXT_ICON',
  Toast = 'TOAST',
  Tooltip = 'TOOLTIP',
}

export enum DesignSystemComponentType {
  Typography = 'TYPOGRAPHY',
  Colors = 'COLORS',
  ColorsVanilla = 'COLORS_VANILLA',
}

export interface AtomicComponentSidebarItem {
  readonly type: StoriesSidebarSectionId.AtomicComponents;
  readonly sidebarItemId: AtomicComponentType;
  readonly title: string;
}

export interface DesignSystemSidebarItem {
  readonly type: StoriesSidebarSectionId.DesignSystem;
  readonly sidebarItemId: DesignSystemComponentType;
  readonly title: string;
}

export interface RendererSidebarItem {
  readonly type: StoriesSidebarSectionId.Renderers;
  readonly sidebarItemId: RendererType;
  readonly title: string;
}

export type StoriesSidebarItem =
  | AtomicComponentSidebarItem
  | DesignSystemSidebarItem
  | RendererSidebarItem;
