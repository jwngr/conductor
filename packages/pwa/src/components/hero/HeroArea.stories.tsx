import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import type {HeroAction} from '@sharedClient/types/heroActions.client.types';

import {Text} from '@src/components/atoms/Text';
import {HeroArea} from '@src/components/hero/HeroArea';
import {StorySection} from '@src/components/stories/StorySection';

const HERO_AREA_STORY_BOTTOM_CONTENT = (
  <Text as="p">
    This is some bottom content, which is long enough to test the layout of the hero area when the
    bottom content is present. It is now long enough to have tested that.
  </Text>
);

const HeroAreaStory: React.FC<{
  readonly storyTitle: string;
  readonly title: string;
  readonly subtitle: string;
  readonly actions: readonly HeroAction[];
  readonly bottomContent?: React.ReactElement;
}> = (props) => {
  const {storyTitle, title, subtitle, actions, bottomContent} = props;

  return (
    <StorySection title={storyTitle}>
      <div className="h-[500px]">
        <HeroArea
          title={title}
          subtitle={subtitle}
          actions={actions}
          bottomContent={bottomContent}
        />
      </div>
    </StorySection>
  );
};

export const HeroAreaStories: React.FC = () => {
  return (
    <>
      <HeroAreaStory
        storyTitle="Minimal hero area"
        title="This is the 1st title"
        subtitle="This is the 1st subtitle"
        actions={[]}
      />

      <HeroAreaStory
        storyTitle="Minimal hero area with long subtitle"
        title="This is the 2nd title"
        subtitle="This is the 2nd subtitle, which is longer than the first one. It is used to test the layout of the hero area when the subtitle is longer than the title."
        actions={[]}
      />

      <HeroAreaStory
        storyTitle="Hero area with actions"
        title="This is the 3rd title"
        subtitle="This is the 3rd subtitle"
        actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
      />

      <HeroAreaStory
        storyTitle="Hero area with bottom content, but no actions"
        title="This is the 4th title"
        subtitle="This is the 4th subtitle"
        actions={[]}
        bottomContent={HERO_AREA_STORY_BOTTOM_CONTENT}
      />

      <HeroAreaStory
        storyTitle="Hero area with actions and bottom content"
        title="This is the 5th title"
        subtitle="This is the 5th subtitle"
        actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
        bottomContent={HERO_AREA_STORY_BOTTOM_CONTENT}
      />
    </>
  );
};
