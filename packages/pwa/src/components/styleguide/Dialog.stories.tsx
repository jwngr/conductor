import {useState} from 'react';

import {Dialog, DialogContent, DialogTrigger} from '@src/components/atoms/Dialog';
import {FlexColumn} from '@src/components/atoms/Flex';
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
            <FlexColumn gap={16}>
              <Text as="h2" bold>
                Dialog Title
              </Text>
              <Text>This is the dialog content.</Text>
            </FlexColumn>
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
            <FlexColumn gap={16}>
              <Text as="h2" bold>
                Controlled Dialog
              </Text>
              <Text>State is controlled externally for this dialog.</Text>
            </FlexColumn>
          </DialogContent>
        </Dialog>
      </StorySection>
    </>
  );
};
