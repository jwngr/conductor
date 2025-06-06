import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import type {FlexProps} from '@src/components/atoms/Flex';
import {P} from '@src/components/atoms/Text';
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
    <P>{children}</P>
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
        <P key={`stacked-text-${index}`}>{`Row ${index + 1}`}</P>
      ))}
    </Box>
  );
};

export const FlexStories: React.FC = () => {
  return (
    <>
      <StorySection title="FlexRow + align">
        <FlexColumn gap={4}>
          <FlexRowTest align="start">
            <TextBox>{`TOP [align="start"]`}</TextBox>
            <StackedTextBox count={3} />
          </FlexRowTest>

          <FlexRowTest align="center">
            <TextBox>{`CENTER [align="center"]`}</TextBox>
            <StackedTextBox count={3} />
          </FlexRowTest>

          <FlexRowTest align="end">
            <TextBox>{`BOTTOM [align="end"]`}</TextBox>
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
          <FlexRowTest justify="start">
            <TextBox>{`LEFT [justify="start"]`}</TextBox>
            <TextBox>LEFT</TextBox>
            <TextBox>LEFT</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="center">
            <TextBox>{`CENTER [justify="center"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>CENTER</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="end">
            <TextBox>{`RIGHT [justify="end"]`}</TextBox>
            <TextBox>RIGHT</TextBox>
            <TextBox>RIGHT</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="between">
            <TextBox>{`LEFT [justify="between"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>RIGHT</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="around">
            <TextBox>{`LEFT [justify="around"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>RIGHT</TextBox>
          </FlexRowTest>

          <FlexRowTest justify="evenly">
            <TextBox>{`LEFT [justify="evenly"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>RIGHT</TextBox>
          </FlexRowTest>
        </FlexColumn>
      </StorySection>

      <StorySection title="FlexColumn + align">
        <FlexColumn gap={4}>
          <FlexColumnTest align="start">
            <TextBox>{`LEFT [align="start"]`}</TextBox>
            <TextBox>LEFT</TextBox>
          </FlexColumnTest>

          <FlexColumnTest align="center">
            <TextBox>{`CENTER [align="center"]`}</TextBox>
            <TextBox>CENTER</TextBox>
          </FlexColumnTest>

          <FlexColumnTest align="end">
            <TextBox>{`RIGHT [align="end"]`}</TextBox>
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
          <FlexColumnTest justify="start" className="h-60">
            <TextBox>{`TOP [justify="start"]`}</TextBox>
            <TextBox>LEFT</TextBox>
            <TextBox>LEFT</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="center" className="h-60">
            <TextBox>{`CENTER [justify="center"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>CENTER</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="end" className="h-60">
            <TextBox>{`BOTTOM [justify="end"]`}</TextBox>
            <TextBox>BOTTOM</TextBox>
            <TextBox>BOTTOM</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="between" className="h-60">
            <TextBox>{`TOP [justify="between"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>BOTTOM</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="around" className="h-60">
            <TextBox>{`TOP [justify="around"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>BOTTOM</TextBox>
          </FlexColumnTest>

          <FlexColumnTest justify="evenly" className="h-60">
            <TextBox>{`TOP [justify="evenly"]`}</TextBox>
            <TextBox>CENTER</TextBox>
            <TextBox>BOTTOM</TextBox>
          </FlexColumnTest>
        </FlexColumn>
      </StorySection>
    </>
  );
};
