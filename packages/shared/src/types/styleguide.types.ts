import {assertNever} from '@shared/lib/utils.shared';

export enum StyleguideSidebarSectionId {
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

export enum RendererType {
  Markdown = 'MARKDOWN',
}

export type StyleguideSidebarItemId =
  | AtomicComponentType
  | DesignSystemComponentType
  | RendererType;

export interface AtomicComponentSidebarItem {
  readonly type: StyleguideSidebarSectionId.AtomicComponents;
  readonly sidebarItemId: AtomicComponentType;
  readonly title: string;
}

export interface DesignSystemSidebarItem {
  readonly type: StyleguideSidebarSectionId.DesignSystem;
  readonly sidebarItemId: DesignSystemComponentType;
  readonly title: string;
}

export interface RendererSidebarItem {
  readonly type: StyleguideSidebarSectionId.Renderers;
  readonly sidebarItemId: RendererType;
  readonly title: string;
}

export type StyleguideSidebarItem =
  | AtomicComponentSidebarItem
  | DesignSystemSidebarItem
  | RendererSidebarItem;

const ORDERED_ATOMIC_COMPONENT_TYPES: AtomicComponentType[] = [
  AtomicComponentType.Link,
  AtomicComponentType.TextIcon,
  AtomicComponentType.ButtonIcon,
  AtomicComponentType.Button,
  AtomicComponentType.Input,
  AtomicComponentType.Dialog,
  AtomicComponentType.Toast,
  AtomicComponentType.Tooltip,
  AtomicComponentType.Divider,
  AtomicComponentType.Flex,
  AtomicComponentType.Spacer,
];

const ORDERED_DESIGN_SYSTEM_COMPONENT_TYPES: DesignSystemComponentType[] = [
  DesignSystemComponentType.Typography,
  DesignSystemComponentType.Colors,
  DesignSystemComponentType.ColorsVanilla,
];

const ORDERED_RENDERER_TYPES: RendererType[] = [RendererType.Markdown];

function getDesignSystemSidebarItemTitle(type: DesignSystemComponentType): string {
  switch (type) {
    case DesignSystemComponentType.Colors:
      return 'Colors';
    case DesignSystemComponentType.ColorsVanilla:
      return 'Colors Vanilla';
    case DesignSystemComponentType.Typography:
      return 'Typography';
    default: {
      assertNever(type);
    }
  }
}

function getAtomicComponentSidebarItemTitle(type: AtomicComponentType): string {
  switch (type) {
    case AtomicComponentType.ButtonIcon:
      return 'ButtonIcon';
    case AtomicComponentType.Button:
      return 'Button';
    case AtomicComponentType.Dialog:
      return 'Dialog';
    case AtomicComponentType.Divider:
      return 'Divider';
    case AtomicComponentType.Flex:
      return 'Flex';
    case AtomicComponentType.Input:
      return 'Input';
    case AtomicComponentType.Link:
      return 'Link';
    case AtomicComponentType.Spacer:
      return 'Spacer';
    case AtomicComponentType.TextIcon:
      return 'TextIcon';
    case AtomicComponentType.Toast:
      return 'Toast';
    case AtomicComponentType.Tooltip:
      return 'Tooltip';
    default: {
      assertNever(type);
    }
  }
}

function getRendererSidebarItemTitle(type: RendererType): string {
  switch (type) {
    case RendererType.Markdown:
      return 'Markdown';
    default: {
      assertNever(type);
    }
  }
}

export class Styleguide {
  public static getDesignSystemSidebarItem(
    type: DesignSystemComponentType
  ): DesignSystemSidebarItem {
    return {
      title: getDesignSystemSidebarItemTitle(type),
      sidebarItemId: type,
      type: StyleguideSidebarSectionId.DesignSystem,
    };
  }

  public static getDesignSystemSidebarItems(): DesignSystemSidebarItem[] {
    return ORDERED_DESIGN_SYSTEM_COMPONENT_TYPES.map((id) =>
      Styleguide.getDesignSystemSidebarItem(id)
    );
  }

  public static getAtomicComponentSidebarItem(
    type: AtomicComponentType
  ): AtomicComponentSidebarItem {
    return {
      title: getAtomicComponentSidebarItemTitle(type),
      sidebarItemId: type,
      type: StyleguideSidebarSectionId.AtomicComponents,
    };
  }

  public static getAtomicComponentSidebarItems(): AtomicComponentSidebarItem[] {
    return ORDERED_ATOMIC_COMPONENT_TYPES.map((type) =>
      Styleguide.getAtomicComponentSidebarItem(type)
    );
  }

  public static getRendererSidebarItem(type: RendererType): RendererSidebarItem {
    return {
      title: getRendererSidebarItemTitle(type),
      sidebarItemId: type,
      type: StyleguideSidebarSectionId.Renderers,
    };
  }

  public static getRendererSidebarItems(): RendererSidebarItem[] {
    return ORDERED_RENDERER_TYPES.map((type) => Styleguide.getRendererSidebarItem(type));
  }
}

export const DEFAULT_STYLEGUIDE_SIDEBAR_ITEM: StyleguideSidebarItem =
  Styleguide.getDesignSystemSidebarItem(DesignSystemComponentType.Typography);
