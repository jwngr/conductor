import {Button} from '@src/components/atoms/Button';
import {FlexRow} from '@src/components/atoms/Flex';
import {StorySection} from '@src/components/styleguide/StorySection';

import {useToast} from '@src/lib/toasts';

export const ToastStories: React.FC = () => {
  const {showToast} = useToast();

  return (
    <>
      <StorySection title="Basic toast">
        <Button
          onClick={() =>
            showToast({
              title: 'Toast Title',
              message: 'This is a basic toast message',
            })
          }
        >
          Show Toast
        </Button>
      </StorySection>

      <StorySection title="Toast with action">
        <Button
          onClick={() =>
            showToast({
              title: 'Undo Action',
              message: 'Item has been deleted',
              action: (
                <Button
                  variant="secondary"
                  onClick={() => {
                    // Intentionally empty for demo purposes
                  }}
                >
                  Undo
                </Button>
              ),
            })
          }
        >
          Show Toast with Action
        </Button>
      </StorySection>

      <StorySection title="Multiple toasts">
        <FlexRow gap={8}>
          <Button
            onClick={() =>
              showToast({
                title: 'First Toast',
                message: 'This is the first toast',
              })
            }
          >
            Show First Toast
          </Button>
          <Button
            onClick={() =>
              showToast({
                title: 'Second Toast',
                message: 'This is the second toast',
              })
            }
          >
            Show Second Toast
          </Button>
        </FlexRow>
      </StorySection>
    </>
  );
};
