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
        <FlexRow gap={16}>
          <Button onClick={() => handleClick('Clicked on primary button')}>Default</Button>
          <Button variant="secondary" onClick={() => handleClick('Clicked on secondary button')}>
            Secondary
          </Button>
          <Button variant="outline" onClick={() => handleClick('Clicked on outline button')}>
            Outline
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleClick('Clicked on destructive button')}
          >
            Destructive
          </Button>
          <Button variant="ghost" onClick={() => handleClick('Clicked on ghost button')}>
            Ghost
          </Button>
          <Button variant="link" onClick={() => handleClick('Clicked on link button')}>
            Link
          </Button>
        </FlexRow>
      </StorySection>

      <StorySection title="Disabled buttons">
        <FlexRow gap={16}>
          <Button disabled onClick={handleDisabledClick}>
            Primary
          </Button>
          <Button disabled variant="secondary" onClick={handleDisabledClick}>
            Secondary
          </Button>
          <Button disabled variant="outline" onClick={handleDisabledClick}>
            Outline
          </Button>
          <Button disabled variant="destructive" onClick={handleDisabledClick}>
            Destructive
          </Button>
          <Button disabled variant="ghost" onClick={handleDisabledClick}>
            Ghost
          </Button>
          <Button disabled variant="link" onClick={handleDisabledClick}>
            Link
          </Button>
        </FlexRow>
      </StorySection>

      <StorySection title="Button sizes">
        <FlexRow gap={16}>
          <Button size="sm" onClick={() => handleClick('Clicked on primary small button')}>
            Small
          </Button>
          <Button size="default" onClick={() => handleClick('Clicked on primary default button')}>
            Default
          </Button>
          <Button size="lg" onClick={() => handleClick('Clicked on primary large button')}>
            Large
          </Button>
          <Button size="icon" onClick={() => handleClick('Clicked on primary button')}>
            Icon
          </Button>
        </FlexRow>
      </StorySection>
    </>
  );
};
