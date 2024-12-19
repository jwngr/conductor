export enum StyleguideSectionId {
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
  Typography = 'TYPOGRAPHY',
}

export const DEFAULT_STYLEGUIDE_SECTION_ID = StyleguideSectionId.Typography;

interface StyleguideSection {
  readonly sectionId: StyleguideSectionId;
  readonly title: string;
}

const STYLEGUIDE_SECTIONS_BY_ID: Record<StyleguideSectionId, StyleguideSection> = {
  [StyleguideSectionId.Button]: {
    sectionId: StyleguideSectionId.Button,
    title: 'Buttons',
  },
  [StyleguideSectionId.ButtonIcon]: {
    sectionId: StyleguideSectionId.ButtonIcon,
    title: 'Button Icon',
  },
  [StyleguideSectionId.Dialog]: {
    sectionId: StyleguideSectionId.Dialog,
    title: 'Dialog',
  },
  [StyleguideSectionId.Divider]: {
    sectionId: StyleguideSectionId.Divider,
    title: 'Divider',
  },
  [StyleguideSectionId.Flex]: {
    sectionId: StyleguideSectionId.Flex,
    title: 'Flex',
  },
  [StyleguideSectionId.Input]: {
    sectionId: StyleguideSectionId.Input,
    title: 'Input',
  },
  [StyleguideSectionId.Link]: {
    sectionId: StyleguideSectionId.Link,
    title: 'Link',
  },
  [StyleguideSectionId.Spacer]: {
    sectionId: StyleguideSectionId.Spacer,
    title: 'Spacer',
  },
  [StyleguideSectionId.TextIcon]: {
    sectionId: StyleguideSectionId.TextIcon,
    title: 'Text Icon',
  },
  [StyleguideSectionId.Toast]: {
    sectionId: StyleguideSectionId.Toast,
    title: 'Toast',
  },
  [StyleguideSectionId.Tooltip]: {
    sectionId: StyleguideSectionId.Tooltip,
    title: 'Tooltip',
  },
  [StyleguideSectionId.Typography]: {
    sectionId: StyleguideSectionId.Typography,
    title: 'Typography',
  },
};

const ORDERED_STYLEGUIDE_SECTION_IDS: StyleguideSectionId[] = [
  StyleguideSectionId.Typography,
  StyleguideSectionId.Link,
  StyleguideSectionId.TextIcon,
  StyleguideSectionId.ButtonIcon,
  StyleguideSectionId.Button,
  StyleguideSectionId.Input,
  StyleguideSectionId.Dialog,
  StyleguideSectionId.Toast,
  StyleguideSectionId.Tooltip,
  StyleguideSectionId.Divider,
  StyleguideSectionId.Flex,
  StyleguideSectionId.Spacer,
];

export class Styleguide {
  public static getOrderedSectionIds(): StyleguideSectionId[] {
    return ORDERED_STYLEGUIDE_SECTION_IDS;
  }

  public static getSectionById(styleguideSectionId: StyleguideSectionId): StyleguideSection {
    return STYLEGUIDE_SECTIONS_BY_ID[styleguideSectionId];
  }
}
