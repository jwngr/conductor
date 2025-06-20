import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {P, Span} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

import {rootRoute} from '@src/routes/__root';

export const LinkStories: React.FC = () => {
  return (
    <>
      <StorySection title="Link Styles">
        {/* Default link with underline */}
        <FlexColumn gap={8}>
          <FlexRow gap={4}>
            <P light>Default:</P>
            <Link to={rootRoute.to}>
              <P underline="always">Click to navigate</P>
            </Link>
          </FlexRow>

          {/* Interactive hover underline */}
          <FlexRow gap={4}>
            <P light>Hover underline:</P>
            <Link to={rootRoute.to}>
              <P underline="hover">Hover me</P>
            </Link>
          </FlexRow>

          {/* Colored link */}
          <FlexRow gap={4}>
            <P light>Colored:</P>
            <Link to={rootRoute.to}>
              <P underline="hover">Blue link</P>
            </Link>
          </FlexRow>

          {/* Bold link */}
          <FlexRow gap={4}>
            <P light>Bold:</P>
            <Link to={rootRoute.to}>
              <P bold underline="hover">
                Bold link
              </P>
            </Link>
          </FlexRow>

          {/* Disabled style */}
          <FlexRow gap={4}>
            <P light>Disabled style:</P>
            <Link to={rootRoute.to} disabled>
              <P>Disabled-looking link</P>
            </Link>
          </FlexRow>
        </FlexColumn>
      </StorySection>

      <StorySection title="Link in Context">
        <div className="border-neutral-2 rounded-lg border bg-white p-4">
          <P>
            This is a paragraph with an{' '}
            <Link to={rootRoute.to}>
              <Span underline="hover" className="text-text-link">
                embedded link
              </Span>
            </Link>{' '}
            in the middle of the text to show how it looks in context.
          </P>
        </div>
      </StorySection>
    </>
  );
};
