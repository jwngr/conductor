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
            <Text className="w-32" light>
              Default:
            </Text>
            <Link to="/example">
              <Text underline="always">Click to navigate</Text>
            </Link>
          </div>

          {/* Interactive hover underline */}
          <div className="flex items-center gap-4">
            <Text className="w-32" light>
              Hover underline:
            </Text>
            <Link to="/example">
              <Text underline="hover">Hover me</Text>
            </Link>
          </div>

          {/* Colored link */}
          <div className="flex items-center gap-4">
            <Text className="w-32" light>
              Colored:
            </Text>
            <Link to="/example">
              <Text className="text-text-link" underline="hover">
                Blue link
              </Text>
            </Link>
          </div>

          {/* Bold link */}
          <div className="flex items-center gap-4">
            <Text className="w-32" light>
              Bold:
            </Text>
            <Link to="/example">
              <Text bold underline="hover">
                Bold link
              </Text>
            </Link>
          </div>

          {/* Disabled style */}
          <div className="flex items-center gap-4">
            <Text className="w-32" light>
              Disabled style:
            </Text>
            <Link to="/example">
              <Text light className="cursor-not-allowed">
                Disabled-looking link
              </Text>
            </Link>
          </div>

          {/* Complex link */}
          <div className="flex items-center gap-4">
            <Text className="w-32" light>
              Complex:
            </Text>
            <Link to="/example">
              <Text bold underline="hover" className="text-text-link transition-colors">
                Interactive complex link
              </Text>
            </Link>
          </div>
        </div>
      </StorySection>

      <StorySection title="Link in Context">
        <div className="border-neutral-2 rounded-lg border bg-white p-4">
          <Text>
            This is a paragraph with an{' '}
            <Link to="/example">
              <Text underline="hover" className="text-text-link inline">
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
