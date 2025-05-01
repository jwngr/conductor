import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

import {vars} from '@src/lib/theme.css';

const Box: React.FC<{readonly children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      padding: '8px 16px',
      backgroundColor: vars.colors.neutral[2],
      borderRadius: vars.radii.sm,
    }}
  >
    {children}
  </div>
);

export const FlexStories: React.FC = () => {
  return (
    <>
      <StorySection title="FlexRow vertical alignment">
        <FlexColumn gap={4}>
          <FlexRow gap={2} align="flex-start">
            <Box>
              <Text>{`TOP [align="flex-start"]`}</Text>
            </Box>
            <Box>
              <Text>Row 1</Text>
              <Text>Row 2</Text>
              <Text>Row 3</Text>
            </Box>
          </FlexRow>

          <FlexRow gap={2} align="center">
            <Box>
              <Text>{`CENTER [align="center"]`}</Text>
            </Box>
            <Box>
              <Text>Row 1</Text>
              <Text>Row 2</Text>
              <Text>Row 3</Text>
            </Box>
          </FlexRow>

          <FlexRow gap={2} align="flex-end">
            <Box>
              <Text>{`BOTTOM [align="flex-end"]`}</Text>
            </Box>
            <Box>
              <Text>Row 1</Text>
              <Text>Row 2</Text>
              <Text>Row 3</Text>
            </Box>
          </FlexRow>
        </FlexColumn>
      </StorySection>

      <StorySection title="FlexRow horizontal spacing">
        <FlexColumn gap={4}>
          <FlexRow gap={2} justify="flex-start">
            <Box>
              <Text>{`LEFT [justify="flex-start"]`}</Text>
            </Box>
            <Box>
              <Text>To the left</Text>
            </Box>
          </FlexRow>

          <FlexRow gap={2} justify="center">
            <Box>
              <Text>{`CENTER [justify="center"]`}</Text>
            </Box>
            <Box>
              <Text>In the middle</Text>
            </Box>
          </FlexRow>

          <FlexRow gap={2} justify="space-between">
            <Box>
              <Text>{`RIGHT [justify="space-between"]`}</Text>
            </Box>
            <Box>
              <Text>To the right</Text>
            </Box>
          </FlexRow>
        </FlexColumn>
      </StorySection>

      <StorySection title="FlexColumn">
        <FlexColumn gap={2}>
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
    </>
  );
};
