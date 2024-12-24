import {ThemeColor} from '@shared/types/theme.types';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

export const TypographyStories: React.FC = () => {
  return (
    <>
      <StorySection title="Headings">
        <FlexColumn gap={8}>
          <Text as="h1">Heading 1</Text>
          <Text as="h2">Heading 2</Text>
          <Text as="h3">Heading 3</Text>
          <Text as="h4">Heading 4</Text>
          <Text as="h5">Heading 5</Text>
          <Text as="h6">Heading 6</Text>
        </FlexColumn>
      </StorySection>

      <StorySection title="Text">
        <FlexColumn gap={8}>
          <Text>Regular text</Text>
          <Text bold>Bold text</Text>
          <Text color={ThemeColor.Neutral500}>Secondary text</Text>
          <Text underline="always">Underlined text</Text>
        </FlexColumn>
      </StorySection>
    </>
  );
};
