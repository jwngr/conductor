import {IconName} from '@shared/types/icons.types';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Icon} from '@src/components/atoms/Icon';
import {P} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const IconStories: React.FC = () => {
  return (
    <>
      <StorySection title="All icons">
        <FlexRow gap={4} wrap>
          {Object.values(IconName).map((name) => (
            <FlexColumn key={name} gap={2} align="center">
              <Icon name={name} size={24} />
              <P monospace>{name}</P>
            </FlexColumn>
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
          <Icon name={IconName.Star} size={24} className="text-red-2" />
          <Icon name={IconName.Star} size={24} className="text-green-2" />
          <Icon name={IconName.Star} size={24} className="text-blue-2" />
        </FlexRow>
      </StorySection>
    </>
  );
};
