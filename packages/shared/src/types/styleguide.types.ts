export enum StyleguideSectionId {
  Typography = 'TYPOGRAPHY',
  Buttons = 'BUTTONS',
}

export const DEFAULT_STYLEGUIDE_SECTION_ID = StyleguideSectionId.Typography;

export interface StyleguideSectionConfig {
  readonly styleguideSectionId: StyleguideSectionId;
  readonly name: string;
}

const STYLEGUIDE_SECTIONS_BY_ID: Record<StyleguideSectionId, StyleguideSectionConfig> = {
  [StyleguideSectionId.Typography]: {
    styleguideSectionId: StyleguideSectionId.Typography,
    name: 'Typography',
  },
  [StyleguideSectionId.Buttons]: {
    styleguideSectionId: StyleguideSectionId.Buttons,
    name: 'Buttons',
  },
};

const ORDERED_STYLEGUIDE_SECTION_IDS: StyleguideSectionId[] = [
  StyleguideSectionId.Typography,
  StyleguideSectionId.Buttons,
];

export class Styleguide {
  public static getOrderedSectionIds(): StyleguideSectionId[] {
    return ORDERED_STYLEGUIDE_SECTION_IDS;
  }

  public static getSectionById(styleguideSectionId: StyleguideSectionId): StyleguideSectionConfig {
    return STYLEGUIDE_SECTIONS_BY_ID[styleguideSectionId];
  }
}
