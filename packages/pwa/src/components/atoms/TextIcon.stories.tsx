import {IconName} from '@shared/types/icons.types';

import {FlexRow} from '@src/components/atoms/Flex';
import {TextIcon} from '@src/components/atoms/TextIcon';
import {StorySection} from '@src/components/stories/StorySection';

export const TextIconStories: React.FC = () => {
  return (
    <>
      <StorySection title="Basic text icons">
        <FlexRow gap={4}>
          <TextIcon name={IconName.Star} size={32} />
          <TextIcon name={IconName.Save} size={32} />
          <TextIcon name={IconName.MarkDone} size={32} />
        </FlexRow>
      </StorySection>

      <StorySection title="Text icon sizes">
        <FlexRow gap={4}>
          <TextIcon name={IconName.Star} size={16} />
          <TextIcon name={IconName.Star} size={24} />
          <TextIcon name={IconName.Star} size={32} />
          <TextIcon name={IconName.Star} size={40} />
        </FlexRow>
      </StorySection>

      <StorySection title="Text icon colors">
        <FlexRow gap={4}>
          <TextIcon name={IconName.Star} size={32} className="text-green-2" />
          <TextIcon name={IconName.Star} size={32} className="text-red-2" />
          <TextIcon name={IconName.Star} size={32} className="text-blue-2" />
        </FlexRow>
      </StorySection>
    </>
  );
};
