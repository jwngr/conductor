import {Styleguide, StyleguideSectionId} from '@shared/types/styleguide.types';

import {StoryWrapper} from '@src/components/styleguide/StoryWrapper';

export const ButtonStories: React.FC = () => {
  const buttonStoriesConfig = Styleguide.getSectionById(StyleguideSectionId.Buttons);
  return <StoryWrapper title={buttonStoriesConfig.name}>TODO</StoryWrapper>;
};
