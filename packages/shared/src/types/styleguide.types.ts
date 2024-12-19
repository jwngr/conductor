export enum StyleguideSectionId {
  Typography = 'TYPOGRAPHY',
  Buttons = 'BUTTONS',
  Divider = 'DIVIDER',
  Spacer = 'SPACER',
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
};

const ORDERED_STYLEGUIDE_SECTION_IDS: StyleguideSectionId[] = [
  StyleguideSectionId.Typography,
  StyleguideSectionId.Buttons,
  StyleguideSectionId.Divider,
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
