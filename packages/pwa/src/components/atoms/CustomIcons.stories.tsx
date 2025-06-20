import {makeCustomFileIcon, makeEmojiIcon, makeSystemIcon} from '@shared/lib/customIcons.shared';

import {IconName} from '@shared/types/icons.types';

import {CustomIcon} from '@src/components/atoms/CustomIcon';
import {FlexRow} from '@src/components/atoms/Flex';
import {StorySection} from '@src/components/stories/StorySection';

const MOCK_FILE_URL = 'https://picsum.photos/32/32';

export const CustomIconStories: React.FC = () => {
  return (
    <>
      <StorySection title="Emoji icons">
        <FlexRow gap={4}>
          <CustomIcon icon={makeEmojiIcon('🌟')} size={16} />
          <CustomIcon icon={makeEmojiIcon('👋')} size={32} />
        </FlexRow>
      </StorySection>

      <StorySection title="System icons">
        <FlexRow gap={4}>
          <CustomIcon icon={makeSystemIcon(IconName.Star)} size={16} />
          <CustomIcon icon={makeSystemIcon(IconName.Debug)} size={32} />
        </FlexRow>
      </StorySection>

      <StorySection title="Custom file icons">
        <FlexRow gap={4}>
          <CustomIcon icon={makeCustomFileIcon(MOCK_FILE_URL)} size={16} />
          <CustomIcon icon={makeCustomFileIcon(MOCK_FILE_URL)} size={32} />
        </FlexRow>
      </StorySection>
    </>
  );
};
