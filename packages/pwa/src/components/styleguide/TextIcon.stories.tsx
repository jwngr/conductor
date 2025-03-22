import {IconName} from '@shared/types/icons.types';

import {TextIcon} from '@src/components/atoms/TextIcon';
import {StorySection} from '@src/components/styleguide/StorySection';

export const TextIconStories: React.FC = () => {
  return (
    <>
      <StorySection title="Basic text icons">
        <div className="flex flex-row items-center gap-2">
          <TextIcon name={IconName.Star} size={32} />
          <TextIcon name={IconName.Save} size={32} />
          <TextIcon name={IconName.MarkDone} size={32} />
        </div>
      </StorySection>

      <StorySection title="Text icon sizes">
        <div className="flex flex-row items-center gap-2">
          <TextIcon name={IconName.Star} size={16} />
          <TextIcon name={IconName.Star} size={24} />
          <TextIcon name={IconName.Star} size={32} />
          <TextIcon name={IconName.Star} size={40} />
        </div>
      </StorySection>

      <StorySection title="Text icon colors">
        <div className="flex flex-row items-center gap-2">
          <TextIcon name={IconName.Star} size={32} className="text-red-2" />
          <TextIcon name={IconName.Star} size={32} className="text-green-2" />
        </div>
      </StorySection>
    </>
  );
};
