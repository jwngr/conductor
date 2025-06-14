import {toast} from '@sharedClient/lib/toasts.client';

import {Button} from '@src/components/atoms/Button';
import {StorySection} from '@src/components/stories/StorySection';

const ToastStory: React.FC<{
  readonly buttonText: string;
  readonly toastTitle?: string;
  readonly toastMessage: string;
  readonly toastAction?: React.ReactNode;
}> = ({buttonText, toastMessage, toastTitle, toastAction}) => {
  return (
    <Button onClick={() => toast(toastTitle, {action: toastAction, description: toastMessage})}>
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
            <Button variant="default" onClick={() => toast.success('Toast undo action clicked')}>
              Undo
            </Button>
          }
        />
      </StorySection>
    </>
  );
};
