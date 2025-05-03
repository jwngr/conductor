import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import type {FlexProps} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

import {vars} from '@src/lib/theme.css';
import {cn} from '@src/lib/utils.pwa';

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

const TextBox: React.FC<{readonly children: React.ReactNode}> = ({children}) => (
  <Box>
    <Text>{children}</Text>
  </Box>
);

const FlexRowTest: React.FC<{readonly children: React.ReactNode} & FlexProps> = ({
  children,
  className,
  ...props
}) => (
  <FlexRow gap={2} className={cn('border-4 border-cyan-500', className)} {...props}>
    {children}
  </FlexRow>
);

const FlexColumnTest: React.FC<{readonly children: React.ReactNode} & FlexProps> = ({
  children,
  className,
  ...props
}) => (
  <FlexColumn gap={2} className={cn('border-4 border-purple-500', className)} {...props}>
    {children}
  </FlexColumn>
);

const StackedTextBox: React.FC<{readonly count: number}> = ({count}) => {
  return (
    <Box>
      {Array.from({length: count}).map((_, index) => (
        <Text key={`stacked-text-${index}`}>{`Row ${index + 1}`}</Text>
      ))}
    </Box>
  );
};

export const FlexStories: React.FC = () => {
  return (
    <>
      <StorySection title="FlexRow + align">
        <FlexColumn gap={4}>
          <FlexRowTest align="flex-start">
            <TextBox>{`TOP [align="flex-start"]`}</TextBox>
            <StackedTextBox count={3} />
          </FlexRowTest>

          <FlexRowTest align="center">
            <TextBox>{`CENTER [align="center"]`}</TextBox>
            <StackedTextBox count={3} />
          </FlexRowTest>

          <FlexRowTest align="flex-end">
            <TextBox>{`BOTTOM [align="flex-end"]`}</TextBox>
            <StackedTextBox count={3} />
          </FlexRowTest>

          <FlexRowTest align="stretch">
            <TextBox>{`ALL [align="stretch"]`}</TextBox>
            <StackedTextBox count={3} />
          </FlexRowTest>

          <FlexRowTest align="baseline">
            <TextBox>{`TOP [align="baseline"]`}</TextBox>
            <StackedTextBox count={3} />
          </FlexRowTest>
        </FlexColumn>
      </StorySection>

      <StorySection title="FlexRow + justify">
        <FlexColumn gap={4}>
          <FlexRowTest justify="flex-start">
            <TextBox>{`LEFT [justify="flex-start"]`}</TextBox>
            <TextBox>LEFT</TextBox>
            <TextBox>LEFT</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="center">
            <TextBox>{`CENTER [justify="center"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>CENTER</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="flex-end">
            <TextBox>{`RIGHT [justify="flex-end"]`}</TextBox>
            <TextBox>RIGHT</TextBox>
            <TextBox>RIGHT</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="space-between">
            <TextBox>{`LEFT [justify="space-between"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>RIGHT</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="space-around">
            <TextBox>{`LEFT [justify="space-around"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>RIGHT</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="space-evenly">
            <TextBox>{`LEFT [justify="space-evenly"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>RIGHT</TextBox>
          </FlexRowTest>
        </FlexColumn>
      </StorySection>

      <StorySection title="FlexColumn + align">
        <FlexColumn gap={4}>
          <FlexColumnTest align="flex-start">
            <TextBox>{`LEFT [align="flex-start"]`}</TextBox>
            <TextBox>LEFT</TextBox>
          </FlexColumnTest>

          <FlexColumnTest align="center">
            <TextBox>{`CENTER [align="center"]`}</TextBox>
            <TextBox>CENTER</TextBox>
          </FlexColumnTest>

          <FlexColumnTest align="flex-end">
            <TextBox>{`RIGHT [align="flex-end"]`}</TextBox>
            <TextBox>RIGHT</TextBox>
          </FlexColumnTest>

          <FlexColumnTest align="stretch">
            <TextBox>{`ALL [align="stretch"]`}</TextBox>
            <TextBox>ALL</TextBox>
          </FlexColumnTest>

          <FlexColumnTest align="baseline">
            <TextBox>{`LEFT [align="baseline"]`}</TextBox>
            <TextBox>LEFT</TextBox>
          </FlexColumnTest>
        </FlexColumn>
      </StorySection>

      <StorySection title="FlexColumn + justify">
        <FlexColumn gap={4}>
          <FlexColumnTest justify="flex-start" className="h-60">
            <TextBox>{`TOP [justify="flex-start"]`}</TextBox>
            <TextBox>LEFT</TextBox>
            <TextBox>LEFT</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="center" className="h-60">
            <TextBox>{`CENTER [justify="center"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>CENTER</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="flex-end" className="h-60">
            <TextBox>{`BOTTOM [justify="flex-end"]`}</TextBox>
            <TextBox>BOTTOM</TextBox>
            <TextBox>BOTTOM</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="space-between" className="h-60">
            <TextBox>{`SPACE BETWEEN [justify="space-between"]`}</TextBox>
            <TextBox>SPACE BETWEEN</TextBox>
            <TextBox>SPACE BETWEEN</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="space-around" className="h-60">
            <TextBox>{`SPACE AROUND [justify="space-around"]`}</TextBox>
            <TextBox>SPACE AROUND</TextBox>
            <TextBox>SPACE AROUND</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="space-evenly" className="h-60">
            <TextBox>{`SPACE EVENLY [justify="space-evenly"]`}</TextBox>
            <TextBox>SPACE EVENLY</TextBox>
            <TextBox>SPACE EVENLY</TextBox>
          </FlexColumnTest>
        </FlexColumn>
      </StorySection>
    </>
  );
};
