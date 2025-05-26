import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import {Text} from '@src/components/atoms/Text';
import {HeroArea} from '@src/components/hero/HeroArea';
import {StorySection} from '@src/components/stories/StorySection';

const BOTTOM_CONTENT = (
  <Text as="p">
    This is some bottom content, which is long enough to test the layout of the hero area when the
    bottom content is present. It is now long enough to have tested that.
  </Text>
);

export const HeroAreaStories: React.FC = () => {
  return (
    <>
      <StorySection title="Minimal hero area">
        <HeroArea title="This is the 1st title" subtitle="This is the 1st subtitle" actions={[]} />
      </StorySection>

      <StorySection title="Minimal hero area with long subtitle">
        <HeroArea
          title="This is the 2nd title"
          subtitle="This is the 2nd subtitle, which is longer than the first one. It is used to test the layout of the hero area when the subtitle is longer than the title."
          actions={[]}
        />
      </StorySection>

      <StorySection title="Hero area with actions">
        <HeroArea
          title="This is the 3rd title"
          subtitle="This is the 3rd subtitle"
          actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
        />
      </StorySection>

      <StorySection title="Hero area with bottom content, but no actions">
        <HeroArea
          title="This is the 4th title"
          subtitle="This is the 4th subtitle"
          actions={[]}
          bottomContent={BOTTOM_CONTENT}
        />
      </StorySection>

      <StorySection title="Hero area with actions and bottom content">
        <HeroArea
          title="This is the 5th title"
          subtitle="This is the 5th subtitle"
          actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
          bottomContent={BOTTOM_CONTENT}
        />
      </StorySection>
    </>
  );
};
