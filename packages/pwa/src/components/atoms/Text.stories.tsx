import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const TextStories: React.FC = () => {
  return (
    <>
      <StorySection title="Text elements">
        <FlexColumn gap={2}>
          <Text as="h1">Heading 1</Text>
          <Text as="h2">Heading 2</Text>
          <Text as="h3">Heading 3</Text>
          <Text as="h4">Heading 4</Text>
          <Text as="h5">Heading 5</Text>
          <Text as="h6">Heading 6</Text>
          <Text as="p">Paragraph text</Text>
          <Text as="span">Inline span text</Text>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text weights">
        <FlexColumn gap={2}>
          <Text>Normal weight</Text>
          <Text bold>Bold weight</Text>
          <Text weight="900">Black weight</Text>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text alignment">
        <FlexColumn gap={2}>
          <Text align="left">Left aligned text</Text>
          <Text align="center">Center aligned text</Text>
          <Text align="right">Right aligned text</Text>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text colors">
        <FlexColumn gap={2}>
          <Text>Default color</Text>
          <Text light>Light color</Text>
          <Text className="text-success">Success color</Text>
          <Text className="text-error">Error color</Text>
          <Text>
            123{' '}
            <Text as="span" className="text-error">
              THIS SPAN SHOULD BE RED
            </Text>{' '}
            789
          </Text>
          <Text className="text-purple-500">
            123{' '}
            <Text as="span" className="text-error">
              THIS SPAN SHOULD BE RED
            </Text>{' '}
            789
          </Text>
          <Text className="text-purple-500">
            123 <Text as="span">THIS SPAN SHOULD BE GREEN</Text> 789
          </Text>
          <Text light>
            123 <Text as="span">THIS SPAN SHOULD BE LIGHT</Text> 789
          </Text>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text styles">
        <FlexColumn gap={2}>
          <Text underline="always">Always underlined</Text>
          <Text underline="hover">Hover to underline</Text>
          <Text underline="never">Never underlined</Text>
          <Text monospace>Monospace font</Text>
          <Text truncate className="w-32">
            This text should be truncated
          </Text>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text with flex">
        <FlexRow gap={2}>
          <Text flex={1} className="bg-cyan-100 p-2">
            flex=1
          </Text>
          <Text flex="auto" className="bg-cyan-200 p-2">
            flex=auto
          </Text>
          <Text flex="initial" className="bg-cyan-300 p-2">
            flex=initial
          </Text>
        </FlexRow>
      </StorySection>
    </>
  );
};
