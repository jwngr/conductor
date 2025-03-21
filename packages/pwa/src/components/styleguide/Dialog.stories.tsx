import {useState} from 'react';

import {Dialog, DialogContent, DialogTrigger} from '@src/components/atoms/Dialog';
import {Text} from '@src/components/atoms/Text';
import {StorySection} from '@src/components/styleguide/StorySection';

export const DialogStories: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <StorySection title="Basic dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Text style={{cursor: 'pointer'}}>Click to open dialog</Text>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-4">
              <Text as="h2" bold>
                Dialog Title
              </Text>
              <Text>This is the dialog content.</Text>
            </div>
          </DialogContent>
        </Dialog>
      </StorySection>

      <StorySection title="Controlled dialog">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Text style={{cursor: 'pointer'}}>
              Click to open controlled dialog (currently {isOpen ? 'open' : 'closed'})
            </Text>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-4">
              <Text as="h2" bold>
                Controlled Dialog
              </Text>
              <Text>State is controlled externally for this dialog.</Text>
            </div>
          </DialogContent>
        </Dialog>
      </StorySection>
    </>
  );
};
