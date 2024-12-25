import {ThemeColor} from '@shared/types/theme.types';

import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

export const LinkStories: React.FC = () => {
  return (
    <>
      <StorySection title="Basic link">
        <Link to="/some-path">
          <Text>Click me to navigate</Text>
        </Link>
      </StorySection>

      <StorySection title="Link with styled text">
        <Link to="/some-path">
          <Text bold color={ThemeColor.Blue500}>
            Styled link text
          </Text>
        </Link>
      </StorySection>
    </>
  );
};
