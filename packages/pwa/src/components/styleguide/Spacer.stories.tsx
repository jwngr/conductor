import {ThemeColor} from '@shared/types/theme.types';

import {FlexRow} from '@src/components/atoms/Flex';
import {Spacer} from '@src/components/atoms/Spacer';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

export const SpacerStories: React.FC = () => {
  return (
    <>
      <StorySection title="Horizontal spacer">
        <FlexRow style={{backgroundColor: ThemeColor.Red200}}>
          <Text>Left</Text>
          <Spacer x={32} />
          <Text>Right</Text>
        </FlexRow>
      </StorySection>

      <StorySection title="Vertical spacer">
        <div style={{backgroundColor: ThemeColor.Neutral200}}>
          <Text>Top</Text>
          <Spacer y={32} />
          <Text>Bottom</Text>
        </div>
      </StorySection>

      <StorySection title="Responsive spacer">
        <FlexRow style={{backgroundColor: ThemeColor.Neutral200}}>
          <Text>Left</Text>
          <Spacer x={{mobile: 16, desktop: 64}} />
          <Text>Right (spacing changes on mobile)</Text>
        </FlexRow>
      </StorySection>

      <StorySection title="Flex spacer">
        <FlexRow style={{backgroundColor: ThemeColor.Neutral200}}>
          <Text>Left</Text>
          <Spacer flex={1} />
          <Text>Right (pushed to end)</Text>
        </FlexRow>
      </StorySection>
    </>
  );
};
