import {ThemeColor} from '@shared/types/theme.types';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

const Box: React.FC<{readonly children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      padding: '8px 16px',
      backgroundColor: ThemeColor.Neutral200,
      borderRadius: 4,
    }}
  >
    {children}
  </div>
);

export const FlexStories: React.FC = () => {
  return (
    <>
      <StorySection title="FlexRow with different alignments">
        <FlexColumn gap={16}>
          <FlexRow gap={8} align="flex-start">
            <Box>
              <Text>align="flex-start"</Text>
            </Box>
            <Box>
              <Text>Taller box</Text>
              <Text>With more content</Text>
            </Box>
          </FlexRow>

          <FlexRow gap={8} align="center">
            <Box>
              <Text>align="center"</Text>
            </Box>
            <Box>
              <Text>Taller box</Text>
              <Text>With more content</Text>
            </Box>
          </FlexRow>

          <FlexRow gap={8} align="flex-end">
            <Box>
              <Text>align="flex-end"</Text>
            </Box>
            <Box>
              <Text>Taller box</Text>
              <Text>With more content</Text>
            </Box>
          </FlexRow>
        </FlexColumn>
      </StorySection>

      <StorySection title="FlexRow with different justify">
        <FlexColumn gap={16}>
          <FlexRow gap={8} justify="flex-start">
            <Box>
              <Text>justify="flex-start"</Text>
            </Box>
            <Box>
              <Text>Second box</Text>
            </Box>
          </FlexRow>

          <FlexRow gap={8} justify="center">
            <Box>
              <Text>justify="center"</Text>
            </Box>
            <Box>
              <Text>Second box</Text>
            </Box>
          </FlexRow>

          <FlexRow gap={8} justify="space-between">
            <Box>
              <Text>justify="space-between"</Text>
            </Box>
            <Box>
              <Text>Second box</Text>
            </Box>
          </FlexRow>
        </FlexColumn>
      </StorySection>

      <StorySection title="FlexColumn">
        <FlexColumn gap={8}>
          <Box>
            <Text>First item</Text>
          </Box>
          <Box>
            <Text>Second item</Text>
          </Box>
          <Box>
            <Text>Third item</Text>
          </Box>
        </FlexColumn>
      </StorySection>

      <StorySection title="Responsive gap">
        <FlexRow gap={{mobile: 8, desktop: 32}}>
          <Box>
            <Text>Gap changes on mobile</Text>
          </Box>
          <Box>
            <Text>Second box</Text>
          </Box>
        </FlexRow>
      </StorySection>
    </>
  );
};
