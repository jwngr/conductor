import {Button} from '@src/components/atoms/Button';
import {FlexRow} from '@src/components/atoms/Flex';
import {StorySection} from '@src/components/styleguide/StorySection';

const handleClick = (message: string): void => {
  window.alert(message);
};

const handleDisabledClick = (): void => {
  window.alert('You should not see this since the button is disabled');
};

export const ButtonStories: React.FC = () => {
  return (
    <>
      <StorySection title="Button variants">
        <FlexRow gap={8}>
          <Button onClick={() => handleClick('Clicked on primary button')}>Primary</Button>
          <Button variant="secondary" onClick={() => handleClick('Clicked on secondary button')}>
            Secondary
          </Button>
        </FlexRow>
      </StorySection>

      <StorySection title="Disabled buttons">
        <FlexRow gap={8}>
          <Button disabled onClick={handleDisabledClick}>
            Disabled primary
          </Button>
          <Button disabled variant="secondary" onClick={handleDisabledClick}>
            Disabled secondary
          </Button>
        </FlexRow>
      </StorySection>
    </>
  );
};
