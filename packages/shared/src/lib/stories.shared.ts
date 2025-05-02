import {assertNever} from '@shared/lib/utils.shared';

import {RendererType} from '@shared/types/renderers.types';
import type {
  AtomicComponentSidebarItem,
  DesignSystemSidebarItem,
  RendererSidebarItem,
} from '@shared/types/stories.types';
import {
  AtomicComponentType,
  DesignSystemComponentType,
  StoriesSidebarSectionId,
} from '@shared/types/stories.types';

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

function makeDesignSystemSidebarItem(type: DesignSystemComponentType): DesignSystemSidebarItem {
  return {
    title: getDesignSystemSidebarItemTitle(type),
    sidebarItemId: type,
    type: StoriesSidebarSectionId.DesignSystem,
  };
}

function makeAtomicComponentSidebarItem(type: AtomicComponentType): AtomicComponentSidebarItem {
  return {
    title: getAtomicComponentSidebarItemTitle(type),
    sidebarItemId: type,
    type: StoriesSidebarSectionId.AtomicComponents,
  };
}

function makeRendererSidebarItem(type: RendererType): RendererSidebarItem {
  return {
    title: getRendererSidebarItemTitle(type),
    sidebarItemId: type,
    type: StoriesSidebarSectionId.Renderers,
  };
}

const ORDERED_DESIGN_SYSTEM_COMPONENT_TYPES: DesignSystemComponentType[] = [
  DesignSystemComponentType.Typography,
  DesignSystemComponentType.Colors,
  DesignSystemComponentType.ColorsVanilla,
];

export function getDesignSystemSidebarItems(): DesignSystemSidebarItem[] {
  return ORDERED_DESIGN_SYSTEM_COMPONENT_TYPES.map((id) => makeDesignSystemSidebarItem(id));
}

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

export function getAtomicComponentSidebarItems(): AtomicComponentSidebarItem[] {
  return ORDERED_ATOMIC_COMPONENT_TYPES.map((type) => makeAtomicComponentSidebarItem(type));
}

const ORDERED_RENDERER_TYPES: RendererType[] = [RendererType.Markdown];

export function getRendererSidebarItems(): RendererSidebarItem[] {
  return ORDERED_RENDERER_TYPES.map((type) => makeRendererSidebarItem(type));
}

export const DEFAULT_STORIES_SIDEBAR_ITEM = getDesignSystemSidebarItems()[0];
