import {IconName} from '@shared/types/icons.types';

import {FlexRow} from '@src/components/atoms/Flex';
import {Icon} from '@src/components/atoms/Icon';
import {StorySection} from '@src/components/stories/StorySection';

export const IconStories: React.FC = () => {
  return (
    <>
      <StorySection title="All icons">
        <FlexRow gap={4} wrap>
          {Object.values(IconName).map((name) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Icon name={name} size={24} />
              <span className="text-sm">{name}</span>
            </div>
          ))}
        </FlexRow>
      </StorySection>

      <StorySection title="Icon sizes">
        <FlexRow gap={4}>
          <Icon name={IconName.Star} size={16} />
          <Icon name={IconName.Star} size={24} />
          <Icon name={IconName.Star} size={32} />
          <Icon name={IconName.Star} size={40} />
        </FlexRow>
      </StorySection>

      <StorySection title="Icon colors">
        <FlexRow gap={4}>
          <Icon name={IconName.Star} size={24} className="text-red-500" />
          <Icon name={IconName.Star} size={24} className="text-green-500" />
          <Icon name={IconName.Star} size={24} className="text-blue-500" />
        </FlexRow>
      </StorySection>
    </>
  );
};
