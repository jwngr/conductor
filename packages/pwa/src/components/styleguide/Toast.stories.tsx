import {Button, ButtonVariant} from '@src/components/atoms/Button';
import {FlexRow} from '@src/components/atoms/Flex';
import {ToastActionElement} from '@src/components/atoms/Toast';
import {StorySection} from '@src/components/styleguide/StorySection';

import {useToast} from '@src/lib/toasts';

const ToastStory: React.FC<{
  readonly buttonText: string;
  readonly toastTitle?: string;
  readonly toastMessage: string;
  readonly toastAction?: ToastActionElement;
}> = ({buttonText, toastMessage, toastTitle, toastAction}) => {
  const {showToast} = useToast();

  return (
    <Button
      variant={ButtonVariant.Primary}
      onClick={() => showToast({title: toastTitle, message: toastMessage, action: toastAction})}
    >
      {buttonText}
    </Button>
  );
};

export const ToastStories: React.FC = () => {
  return (
    <>
      <StorySection title="Basic toasts">
        <ToastStory buttonText="Show toast w/ short message" toastMessage="Basic toast message" />
        <ToastStory
          buttonText="Show toast w/ long message"
          toastMessage="This is a basic toast message that will likely wrap onto another line since there is not enough space on just one line for it"
        />
      </StorySection>

      <StorySection title="Toasts with titles">
        <ToastStory
          buttonText="Show short toast with title"
          toastTitle="Toast with title"
          toastMessage="This is a short one"
        />
        <ToastStory
          buttonText="Show long toast with title"
          toastTitle="Toast with title"
          toastMessage="This is a longer toast message that will likely wrap onto another line since there is not enough space on just one line for it"
        />
      </StorySection>

      <StorySection title="Toasts with actions">
        <ToastStory
          buttonText="Show toast with action"
          toastTitle="Undo action"
          toastMessage="Item has been deleted"
          toastAction={
            <Button
              variant={ButtonVariant.Secondary}
              onClick={() => window.alert('Toast action clicked')}
            >
              Undo
            </Button>
          }
        />
      </StorySection>
    </>
  );
};
