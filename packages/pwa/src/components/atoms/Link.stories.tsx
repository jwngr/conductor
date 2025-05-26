import type {WithChildren} from '@sharedClient/types/utils.client.types';

import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

import {rootRoute} from '@src/routes/__root';

const StoryNavLink: React.FC<WithChildren> = ({children}) => {
  return <Link to={rootRoute.fullPath}>{children}</Link>;
};

export const LinkStories: React.FC = () => {
  return (
    <>
      <StorySection title="Link Styles">
        {/* Default link with underline */}
        <FlexColumn gap={8}>
          <FlexRow gap={4}>
            <Text className="w-32" light>
              Default:
            </Text>
            <StoryNavLink>
              <Text underline="always">Click to navigate</Text>
            </StoryNavLink>
          </FlexRow>

          {/* Interactive hover underline */}
          <FlexRow gap={4}>
            <Text className="w-32" light>
              Hover underline:
            </Text>
            <StoryNavLink>
              <Text underline="hover">Hover me</Text>
            </StoryNavLink>
          </FlexRow>

          {/* Colored link */}
          <FlexRow gap={4}>
            <Text className="w-32" light>
              Colored:
            </Text>
            <StoryNavLink>
              <Text className="text-text-link" underline="hover">
                Blue link
              </Text>
            </StoryNavLink>
          </FlexRow>

          {/* Bold link */}
          <FlexRow gap={4}>
            <Text className="w-32" light>
              Bold:
            </Text>
            <StoryNavLink>
              <Text bold underline="hover">
                Bold link
              </Text>
            </StoryNavLink>
          </FlexRow>

          {/* Disabled style */}
          <FlexRow gap={4}>
            <Text className="w-32" light>
              Disabled style:
            </Text>
            <StoryNavLink>
              <Text light className="cursor-not-allowed">
                Disabled-looking link
              </Text>
            </StoryNavLink>
          </FlexRow>

          {/* Complex link */}
          <FlexRow gap={4}>
            <Text className="w-32" light>
              Complex:
            </Text>
            <StoryNavLink>
              <Text bold underline="hover" className="text-text-link transition-colors">
                Interactive complex link
              </Text>
            </StoryNavLink>
          </FlexRow>
        </FlexColumn>
      </StorySection>

      <StorySection title="Link in Context">
        <div className="border-neutral-2 rounded-lg border bg-white p-4">
          <Text>
            This is a paragraph with an{' '}
            <StoryNavLink>
              <Text underline="hover" className="text-text-link inline">
                embedded link
              </Text>
            </StoryNavLink>{' '}
            in the middle of the text to show how it looks in context.
          </Text>
        </div>
      </StorySection>
    </>
  );
};
