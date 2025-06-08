import {Badge} from '@src/components/atoms/Badge';
import {FlexColumn} from '@src/components/atoms/Flex';
import {StorySection} from '@src/components/stories/StorySection';

export const BadgeStories: React.FC = () => {
  return (
    <StorySection title="Badge variants">
      <FlexColumn gap={4} align="start">
        <Badge variant="default">Default</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </FlexColumn>
    </StorySection>
  );
};
