import {FlexRow} from '@src/components/atoms/Flex';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@src/components/atoms/Toast';

import {useToast} from '@src/lib/toasts';

export const Toaster: React.FC = () => {
  const {toasts} = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({toastId, title, description, action, ...toastProps}) {
        return (
          <Toast key={toastId} {...toastProps}>
            <FlexRow gap={8}>
              {title ? <ToastTitle>{title}</ToastTitle> : null}
              {description ? <ToastDescription>{description}</ToastDescription> : null}
            </FlexRow>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
};
