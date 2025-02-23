import {ThemeColor} from '@shared/types/theme.types';

import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

export const LinkStories: React.FC = () => {
  return (
    <>
      <StorySection title="Link Styles">
        {/* Default link with underline */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <Text className="w-32" color={ThemeColor.Neutral500}>
              Default:
            </Text>
            <Link to="/example">
              <Text underline="always" color={ThemeColor.Neutral900}>
                Click to navigate
              </Text>
            </Link>
          </div>

          {/* Interactive hover underline */}
          <div className="flex items-center gap-4">
            <Text className="w-32" color={ThemeColor.Neutral500}>
              Hover underline:
            </Text>
            <Link to="/example">
              <Text underline="hover" color={ThemeColor.Neutral900}>
                Hover me
              </Text>
            </Link>
          </div>

          {/* Colored link */}
          <div className="flex items-center gap-4">
            <Text className="w-32" color={ThemeColor.Neutral500}>
              Colored:
            </Text>
            <Link to="/example">
              <Text color={ThemeColor.Blue500} underline="hover">
                Blue link
              </Text>
            </Link>
          </div>

          {/* Bold link */}
          <div className="flex items-center gap-4">
            <Text className="w-32" color={ThemeColor.Neutral500}>
              Bold:
            </Text>
            <Link to="/example">
              <Text bold color={ThemeColor.Neutral900} underline="hover">
                Bold link
              </Text>
            </Link>
          </div>

          {/* Disabled style */}
          <div className="flex items-center gap-4">
            <Text className="w-32" color={ThemeColor.Neutral500}>
              Disabled style:
            </Text>
            <Link to="/example">
              <Text color={ThemeColor.Neutral400} className="cursor-not-allowed">
                Disabled-looking link
              </Text>
            </Link>
          </div>

          {/* Complex link */}
          <div className="flex items-center gap-4">
            <Text className="w-32" color={ThemeColor.Neutral500}>
              Complex:
            </Text>
            <Link to="/example">
              <Text
                bold
                color={ThemeColor.Blue500}
                underline="hover"
                className="transition-colors hover:text-blue-600"
              >
                Interactive complex link
              </Text>
            </Link>
          </div>
        </div>
      </StorySection>

      <StorySection title="Link in Context">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <Text color={ThemeColor.Neutral900}>
            This is a paragraph with an{' '}
            <Link to="/example">
              <Text color={ThemeColor.Blue500} underline="hover" className="inline">
                embedded link
              </Text>
            </Link>{' '}
            in the middle of the text to show how it looks in context.
          </Text>
        </div>
      </StorySection>
    </>
  );
};
