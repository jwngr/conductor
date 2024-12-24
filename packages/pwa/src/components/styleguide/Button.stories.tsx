import {Button, ButtonVariant} from '@src/components/atoms/Button';
import {FlexRow} from '@src/components/atoms/Flex';
import {StorySection} from '@src/components/styleguide/StorySection';

const handleClick = (message: string) => {
  window.alert(message);
};

const handleDisabledClick = () => {
  window.alert('You should not see this since the button is disabled');
};

export const ButtonStories: React.FC = () => {
  return (
    <>
      <StorySection title="Button variants">
        <FlexRow gap={8}>
          <Button
            variant={ButtonVariant.Primary}
            onClick={() => handleClick('Clicked on primary button')}
          >
            Primary
          </Button>
          <Button
            variant={ButtonVariant.Secondary}
            onClick={() => handleClick('Clicked on secondary button')}
          >
            Secondary
          </Button>
        </FlexRow>
      </StorySection>

      <StorySection title="Disabled buttons">
        <FlexRow gap={8}>
          <Button disabled variant={ButtonVariant.Primary} onClick={handleDisabledClick}>
            Disabled primary
          </Button>
          <Button disabled variant={ButtonVariant.Secondary} onClick={handleDisabledClick}>
            Disabled secondary
          </Button>
        </FlexRow>
      </StorySection>
    </>
  );
};
