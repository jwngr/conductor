export enum StyleguideSectionId {
  Typography = 'TYPOGRAPHY',
  Buttons = 'BUTTONS',
  Divider = 'DIVIDER',
  Spacer = 'SPACER',
  Toast = 'TOAST',
  Tooltip = 'TOOLTIP',
  ButtonIcon = 'BUTTON_ICON',
  TextIcon = 'TEXT_ICON',
}

export const DEFAULT_STYLEGUIDE_SECTION_ID = StyleguideSectionId.Typography;

interface StyleguideSection {
  readonly sectionId: StyleguideSectionId;
  readonly name: string;
}

const STYLEGUIDE_SECTIONS_BY_ID: Record<StyleguideSectionId, StyleguideSection> = {
  [StyleguideSectionId.Typography]: {
    sectionId: StyleguideSectionId.Typography,
    name: 'Typography',
  },
  [StyleguideSectionId.Buttons]: {
    sectionId: StyleguideSectionId.Buttons,
    name: 'Buttons',
  },
  [StyleguideSectionId.Divider]: {
    sectionId: StyleguideSectionId.Divider,
    name: 'Divider',
  },
  [StyleguideSectionId.Spacer]: {
    sectionId: StyleguideSectionId.Spacer,
    name: 'Spacer',
  },
  [StyleguideSectionId.Toast]: {
    sectionId: StyleguideSectionId.Toast,
    name: 'Toast',
  },
  [StyleguideSectionId.Tooltip]: {
    sectionId: StyleguideSectionId.Tooltip,
    name: 'Tooltip',
  },
  [StyleguideSectionId.ButtonIcon]: {
    sectionId: StyleguideSectionId.ButtonIcon,
    name: 'Button Icon',
  },
  [StyleguideSectionId.TextIcon]: {
    sectionId: StyleguideSectionId.TextIcon,
    name: 'Text Icon',
  },
};

const ORDERED_STYLEGUIDE_SECTION_IDS: StyleguideSectionId[] = [
  StyleguideSectionId.Typography,
  StyleguideSectionId.Buttons,
  StyleguideSectionId.ButtonIcon,
  StyleguideSectionId.TextIcon,
  StyleguideSectionId.Divider,
  StyleguideSectionId.Spacer,
  StyleguideSectionId.Toast,
  StyleguideSectionId.Tooltip,
];

export class Styleguide {
  public static getOrderedSectionIds(): StyleguideSectionId[] {
    return ORDERED_STYLEGUIDE_SECTION_IDS;
  }

  public static getSectionById(styleguideSectionId: StyleguideSectionId): StyleguideSection {
    return STYLEGUIDE_SECTIONS_BY_ID[styleguideSectionId];
  }
}
