import {toast} from '@sharedClient/lib/toasts.client';

import {Button} from '@src/components/atoms/Button';
import {StorySection} from '@src/components/stories/StorySection';

const handleClick = (message: string): void => {
  toast(message);
};

const handleDisabledClick = (): void => {
  toast.error('You should not see this since the button is disabled');
};

export const ButtonStories: React.FC = () => {
  return (
    <>
      <StorySection title="Button variants">
        <div className="flex flex-row items-center gap-4">
          <Button variant="default" onClick={() => handleClick('Clicked on primary button')}>
            Primary
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleClick('Clicked on destructive button')}
          >
            Destructive
          </Button>
          <Button variant="outline" onClick={() => handleClick('Clicked on outline button')}>
            Outline
          </Button>
          <Button variant="ghost" onClick={() => handleClick('Clicked on ghost button')}>
            Ghost
          </Button>
          <Button variant="link" onClick={() => handleClick('Clicked on link button')}>
            Link
          </Button>
        </div>
      </StorySection>

      <StorySection title="Disabled buttons">
        <div className="flex flex-row items-center gap-4">
          <Button disabled onClick={handleDisabledClick}>
            Primary
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
        </div>
      </StorySection>

      <StorySection title="Button sizes">
        <div className="flex flex-row items-center gap-4">
          <Button size="sm" onClick={() => handleClick('Clicked on primary small button')}>
            Small
          </Button>
          <Button size="default" onClick={() => handleClick('Clicked on primary default button')}>
            Default
          </Button>
          <Button size="lg" onClick={() => handleClick('Clicked on primary large button')}>
            Large
          </Button>
        </div>
      </StorySection>

      <StorySection title="Custom buttons">
        <div className="flex flex-row items-center gap-4">
          <Button
            className="bg-purple-2 hover:bg-purple-2/80"
            onClick={() => handleClick('Clicked on purple button')}
          >
            Purple
          </Button>
          <Button className="uppercase" onClick={() => handleClick('Clicked on uppercase button')}>
            Uppercase
          </Button>
          <Button className="p-8" onClick={() => handleClick('Clicked on padding button')}>
            More padding
          </Button>
        </div>
      </StorySection>
    </>
  );
};
