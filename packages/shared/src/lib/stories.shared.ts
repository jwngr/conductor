import {assertNever} from '@shared/lib/utils.shared';

import {RendererType} from '@shared/types/renderers.types';
import type {
  AtomicComponentSidebarItem,
  DesignSystemSidebarItem,
  MoleculeComponentSidebarItem,
  RendererSidebarItem,
  StoriesSidebarItem,
  StoriesSidebarItemId,
} from '@shared/types/stories.types';
import {
  AtomicComponentType,
  DesignSystemComponentType,
  MoleculeComponentType,
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
    case DesignSystemComponentType.Icons:
      return 'Icons';
    default: {
      assertNever(type);
    }
  }
}

function getAtomicComponentSidebarItemTitle(type: AtomicComponentType): string {
  switch (type) {
    case AtomicComponentType.Badge:
      return 'Badge';
    case AtomicComponentType.Button:
      return 'Button';
    case AtomicComponentType.ButtonIcon:
      return 'ButtonIcon';
    case AtomicComponentType.Checkbox:
      return 'Checkbox';
    case AtomicComponentType.Dialog:
      return 'Dialog';
    case AtomicComponentType.Divider:
      return 'Divider';
    case AtomicComponentType.DropdownMenu:
      return 'DropdownMenu';
    case AtomicComponentType.Flex:
      return 'Flex';
    case AtomicComponentType.Input:
      return 'Input';
    case AtomicComponentType.Link:
      return 'Link';
    case AtomicComponentType.Spacer:
      return 'Spacer';
    case AtomicComponentType.Text:
      return 'Text';
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

function getMoleculeComponentSidebarItemTitle(type: MoleculeComponentType): string {
  switch (type) {
    case MoleculeComponentType.HeroArea:
      return 'HeroArea';
    case MoleculeComponentType.ErrorArea:
      return 'ErrorArea';
    default: {
      assertNever(type);
    }
  }
}
function makeDesignSystemSidebarItem(type: DesignSystemComponentType): DesignSystemSidebarItem {
  return {
    title: getDesignSystemSidebarItemTitle(type),
    sidebarItemId: type,
    sidebarSectionId: StoriesSidebarSectionId.DesignSystem,
  };
}

function makeAtomicComponentSidebarItem(type: AtomicComponentType): AtomicComponentSidebarItem {
  return {
    title: getAtomicComponentSidebarItemTitle(type),
    sidebarItemId: type,
    sidebarSectionId: StoriesSidebarSectionId.AtomicComponents,
  };
}

function makeRendererSidebarItem(type: RendererType): RendererSidebarItem {
  return {
    title: getRendererSidebarItemTitle(type),
    sidebarItemId: type,
    sidebarSectionId: StoriesSidebarSectionId.Renderers,
  };
}

function makeMoleculeComponentSidebarItem(
  type: MoleculeComponentType
): MoleculeComponentSidebarItem {
  return {
    title: getMoleculeComponentSidebarItemTitle(type),
    sidebarItemId: type,
    sidebarSectionId: StoriesSidebarSectionId.Molecules,
  };
}

const ORDERED_DESIGN_SYSTEM_COMPONENT_TYPES: DesignSystemComponentType[] = [
  DesignSystemComponentType.Typography,
  DesignSystemComponentType.Colors,
  DesignSystemComponentType.ColorsVanilla,
  DesignSystemComponentType.Icons,
];

export function getDesignSystemSidebarItems(): DesignSystemSidebarItem[] {
  return ORDERED_DESIGN_SYSTEM_COMPONENT_TYPES.map((id) => makeDesignSystemSidebarItem(id));
}

const ORDERED_ATOMIC_COMPONENT_TYPES: AtomicComponentType[] = [
  AtomicComponentType.Text,
  AtomicComponentType.Link,
  AtomicComponentType.TextIcon,
  AtomicComponentType.ButtonIcon,
  AtomicComponentType.Button,
  AtomicComponentType.Badge,
  AtomicComponentType.Checkbox,
  AtomicComponentType.Input,
  AtomicComponentType.Dialog,
  AtomicComponentType.Toast,
  AtomicComponentType.Tooltip,
  AtomicComponentType.Divider,
  AtomicComponentType.DropdownMenu,
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

const ORDERED_MOLECULE_COMPONENT_TYPES: MoleculeComponentType[] = [
  MoleculeComponentType.HeroArea,
  MoleculeComponentType.ErrorArea,
];

export function getMoleculeComponentSidebarItems(): MoleculeComponentSidebarItem[] {
  return ORDERED_MOLECULE_COMPONENT_TYPES.map((type) => makeMoleculeComponentSidebarItem(type));
}

export const DEFAULT_STORIES_SIDEBAR_ITEM = getDesignSystemSidebarItems()[0];

export function findStoriesSidebarItemById(
  itemId: StoriesSidebarItemId
): StoriesSidebarItem | null {
  const designSystemSidebarItems = getDesignSystemSidebarItems();
  const designSystemItem = designSystemSidebarItems.find((item) => item.sidebarItemId === itemId);
  if (designSystemItem) return designSystemItem;

  const atomicComponentSidebarItems = getAtomicComponentSidebarItems();
  const atomicComponentItem = atomicComponentSidebarItems.find(
    (item) => item.sidebarItemId === itemId
  );
  if (atomicComponentItem) return atomicComponentItem;

  const rendererSidebarItems = getRendererSidebarItems();
  const rendererItem = rendererSidebarItems.find((item) => item.sidebarItemId === itemId);
  if (rendererItem) return rendererItem;

  return null;
}
