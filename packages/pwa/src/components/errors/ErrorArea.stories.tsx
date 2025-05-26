import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import {ErrorArea} from '@src/components/errors/ErrorArea';
import {StorySection} from '@src/components/stories/StorySection';

export const ErrorAreaStories: React.FC = () => {
  return (
    <>
      <StorySection title="Minimal error area">
        <ErrorArea
          error={new Error('This is the 1st error')}
          title="This is the 1st title"
          subtitle="This is the 1st subtitle"
          actions={[]}
        />
      </StorySection>

      <StorySection title="Minimal error area with long subtitle">
        <ErrorArea
          error={new Error('This is the 2nd error')}
          title="This is the 2nd title"
          subtitle="This is the 2nd subtitle, which is longer than the first one. It is used to test the layout of the error area when the subtitle is longer than the title."
          actions={[]}
        />
      </StorySection>

      <StorySection title="Error area with actions">
        <ErrorArea
          error={new Error('This is the 3rd error')}
          title="This is the 3rd title"
          subtitle="This is the 3rd subtitle"
          actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
        />
      </StorySection>
    </>
  );
};
