import {IconName} from '@shared/types/icons.types';
import {ThemeColor} from '@shared/types/theme.types';

import {FlexRow} from '@src/components/atoms/Flex';
import {TextIcon} from '@src/components/atoms/TextIcon';
import {StorySection} from '@src/components/styleguide/StorySection';

export const TextIconStories: React.FC = () => {
  return (
    <>
      <StorySection title="Basic text icons">
        <FlexRow gap={8}>
          <TextIcon name={IconName.Star} size={32} />
          <TextIcon name={IconName.Save} size={32} />
          <TextIcon name={IconName.MarkDone} size={32} />
        </FlexRow>
      </StorySection>

      <StorySection title="Text icon sizes">
        <FlexRow gap={8} align="center">
          <TextIcon name={IconName.Star} size={16} />
          <TextIcon name={IconName.Star} size={24} />
          <TextIcon name={IconName.Star} size={32} />
          <TextIcon name={IconName.Star} size={40} />
        </FlexRow>
      </StorySection>

      <StorySection title="Text icon colors">
        <FlexRow gap={8}>
          <TextIcon name={IconName.Star} size={32} color={ThemeColor.Red500} />
          <TextIcon name={IconName.Star} size={32} color={ThemeColor.Green500} />
        </FlexRow>
      </StorySection>
    </>
  );
};
