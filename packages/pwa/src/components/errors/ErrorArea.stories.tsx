import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import type {HeroAction} from '@sharedClient/types/heroActions.client.types';

import {ErrorArea} from '@src/components/errors/ErrorArea';
import {StorySection} from '@src/components/stories/StorySection';

const ErrorAreaStory: React.FC<{
  readonly storyTitle: string;
  readonly error: Error;
  readonly title: string;
  readonly subtitle: string;
  readonly actions: readonly HeroAction[];
}> = (props) => {
  const {storyTitle, error, title, subtitle, actions} = props;

  return (
    <StorySection title={storyTitle}>
      <div className="h-[500px]">
        <ErrorArea error={error} title={title} subtitle={subtitle} actions={actions} />
      </div>
    </StorySection>
  );
};

export const ErrorAreaStories: React.FC = () => {
  return (
    <>
      <ErrorAreaStory
        storyTitle="Minimal error area"
        error={new Error('This is the 1st error')}
        title="This is the 1st title"
        subtitle="This is the 1st subtitle"
        actions={[]}
      />

      <ErrorAreaStory
        storyTitle="Minimal error area with long subtitle"
        error={new Error('This is the 2nd error')}
        title="This is the 2nd title"
        subtitle="This is the 2nd subtitle, which is longer than the first one. It is used to test the layout of the error area when the subtitle is longer than the title."
        actions={[]}
      />

      <ErrorAreaStory
        storyTitle="Error area with actions"
        error={new Error('This is the 3rd error')}
        title="This is the 3rd title"
        subtitle="This is the 3rd subtitle"
        actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
      />
    </>
  );
};
