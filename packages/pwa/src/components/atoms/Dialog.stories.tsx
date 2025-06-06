import {useState} from 'react';

import {Dialog, DialogContent, DialogTrigger} from '@src/components/atoms/Dialog';
import {H2, P} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/stories/StorySection';

export const DialogStories: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <StorySection title="Basic dialog">
        <Dialog>
          <DialogTrigger asChild>
            <P style={{cursor: 'pointer'}}>Click to open dialog</P>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-4">
              <H2 bold>Dialog Title</H2>
              <P>This is the dialog content.</P>
            </div>
          </DialogContent>
        </Dialog>
      </StorySection>

      <StorySection title="Controlled dialog">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <P style={{cursor: 'pointer'}}>
              Click to open controlled dialog (currently {isOpen ? 'open' : 'closed'})
            </P>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-4">
              <H2 bold>Controlled Dialog</H2>
              <P>State is controlled externally for this dialog.</P>
            </div>
          </DialogContent>
        </Dialog>
      </StorySection>
    </>
  );
};
