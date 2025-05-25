import {Badge} from '@src/components/atoms/Badge';
import {StorySection} from '@src/components/stories/StorySection';

export const BadgeStories: React.FC = () => {
  return (
    <>
      <StorySection title="Badge variants">
        <div className="flex flex-row items-center gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </StorySection>

      <StorySection title="Badge with custom classes">
        <div className="flex flex-row items-center gap-4">
          <Badge variant="outline" className="p-4">
            Custom padding
          </Badge>
          <Badge variant="outline" className="text-lg">
            Large text
          </Badge>
          <Badge variant="outline" className="uppercase">
            Uppercase
          </Badge>
        </div>
      </StorySection>
    </>
  );
};
