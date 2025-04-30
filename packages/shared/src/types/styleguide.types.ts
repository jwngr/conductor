export enum StyleguideStoryGroupId {
  Button = 'BUTTON',
  ButtonIcon = 'BUTTON_ICON',
  Dialog = 'DIALOG',
  Divider = 'DIVIDER',
  Input = 'INPUT',
  Link = 'LINK',
  Spacer = 'SPACER',
  TextIcon = 'TEXT_ICON',
  Toast = 'TOAST',
  Tooltip = 'TOOLTIP',
  Typography = 'TYPOGRAPHY',
  MarkdownContentViewer = 'MARKDOWN_CONTENT_VIEWER',
  Colors = 'COLORS',
  ColorsVanilla = 'COLORS_VANILLA',
}

export const DEFAULT_STYLEGUIDE_STORY_GROUP_ID = StyleguideStoryGroupId.Typography;

interface StyleguideStoryGroup {
  readonly storyGroupId: StyleguideStoryGroupId;
  readonly title: string;
}

const STYLEGUIDE_STORY_GROUPS_BY_ID: Record<StyleguideStoryGroupId, StyleguideStoryGroup> = {
  [StyleguideStoryGroupId.Button]: {
    storyGroupId: StyleguideStoryGroupId.Button,
    title: 'Buttons',
  },
  [StyleguideStoryGroupId.ButtonIcon]: {
    storyGroupId: StyleguideStoryGroupId.ButtonIcon,
    title: 'Button Icon',
  },
  [StyleguideStoryGroupId.Dialog]: {
    storyGroupId: StyleguideStoryGroupId.Dialog,
    title: 'Dialog',
  },
  [StyleguideStoryGroupId.Divider]: {
    storyGroupId: StyleguideStoryGroupId.Divider,
    title: 'Divider',
  },
  [StyleguideStoryGroupId.Input]: {
    storyGroupId: StyleguideStoryGroupId.Input,
    title: 'Input',
  },
  [StyleguideStoryGroupId.Link]: {
    storyGroupId: StyleguideStoryGroupId.Link,
    title: 'Link',
  },
  [StyleguideStoryGroupId.Spacer]: {
    storyGroupId: StyleguideStoryGroupId.Spacer,
    title: 'Spacer',
  },
  [StyleguideStoryGroupId.TextIcon]: {
    storyGroupId: StyleguideStoryGroupId.TextIcon,
    title: 'Text Icon',
  },
  [StyleguideStoryGroupId.Toast]: {
    storyGroupId: StyleguideStoryGroupId.Toast,
    title: 'Toast',
  },
  [StyleguideStoryGroupId.Tooltip]: {
    storyGroupId: StyleguideStoryGroupId.Tooltip,
    title: 'Tooltip',
  },
  [StyleguideStoryGroupId.Typography]: {
    storyGroupId: StyleguideStoryGroupId.Typography,
    title: 'Typography',
  },
  [StyleguideStoryGroupId.Colors]: {
    storyGroupId: StyleguideStoryGroupId.Colors,
    title: 'Colors (Tailwind)',
  },
  [StyleguideStoryGroupId.ColorsVanilla]: {
    storyGroupId: StyleguideStoryGroupId.ColorsVanilla,
    title: 'Colors (Vanilla)',
  },
  [StyleguideStoryGroupId.MarkdownContentViewer]: {
    storyGroupId: StyleguideStoryGroupId.MarkdownContentViewer,
    title: 'Markdown',
  },
};

const ORDERED_ATOMIC_COMPONENT_STORY_GROUP_IDS: StyleguideStoryGroupId[] = [
  StyleguideStoryGroupId.Typography,
  StyleguideStoryGroupId.Colors,
  StyleguideStoryGroupId.ColorsVanilla,
  StyleguideStoryGroupId.Link,
  StyleguideStoryGroupId.TextIcon,
  StyleguideStoryGroupId.ButtonIcon,
  StyleguideStoryGroupId.Button,
  StyleguideStoryGroupId.Input,
  StyleguideStoryGroupId.Dialog,
  StyleguideStoryGroupId.Toast,
  StyleguideStoryGroupId.Tooltip,
  StyleguideStoryGroupId.Divider,
  StyleguideStoryGroupId.Spacer,
];

const ORDERED_CONTENT_VIEWER_STORY_GROUP_IDS: StyleguideStoryGroupId[] = [
  StyleguideStoryGroupId.MarkdownContentViewer,
];

export class Styleguide {
  public static getSectionById(storyGroupId: StyleguideStoryGroupId): StyleguideStoryGroup {
    return STYLEGUIDE_STORY_GROUPS_BY_ID[storyGroupId];
  }

  public static getOrderedAtomicComponentIds(): StyleguideStoryGroupId[] {
    return ORDERED_ATOMIC_COMPONENT_STORY_GROUP_IDS;
  }

  public static getOrderedContentViewerIds(): StyleguideStoryGroupId[] {
    return ORDERED_CONTENT_VIEWER_STORY_GROUP_IDS;
  }
}
