import * as DialogPrimitive from '@radix-ui/react-dialog';
import type React from 'react';
import {forwardRef} from 'react';
import styled from 'styled-components';

import {IconName} from '@shared/types/icons.types';
import {ThemeColor} from '@shared/types/theme.types';

import {Icon} from '@src/components/atoms/Icon';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlayWrapper = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral900]};
  opacity: 0.8;
  // TODO: Add animation.
`;

const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>((props, ref) => <DialogOverlayWrapper ref={ref} {...props} />);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContentWrapper = styled(DialogPrimitive.Content)`
  position: fixed;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  z-index: 50;
  display: grid;
  max-height: 80%;
  max-width: 80%;
  width: 960px;
  overflow: auto;
  background-color: ${({theme}) => theme.colors[ThemeColor.Neutral200]};
  border: 1px solid ${({theme}) => theme.colors[ThemeColor.Neutral500]};
  gap: 4px;
  padding: 20px 20px;
  // TODO: Add box shadow.
  // TODO: Add animation.
`;

const CloseButtonWrapper = styled(DialogPrimitive.Close)`
  position: absolute;
  top: 12px;
  right: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: solid 2px transparent;
  background-color: transparent;

  transition: opacity 0.2s ease-in-out;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }

  &:focus {
    opacity: 1;
    background-color: ${({theme}) => theme.colors[ThemeColor.Neutral200]};
    border: solid 2px ${({theme}) => theme.colors[ThemeColor.Neutral500]};
  }
`;

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({children, ...otherProps}, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogContentWrapper ref={ref} {...otherProps}>
      {children}
      <CloseButtonWrapper aria-label="Close">
        <Icon name={IconName.Cancel} size={16} />
      </CloseButtonWrapper>
    </DialogContentWrapper>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  text-align: center;

  @media (min-width: 640px) {
    text-align: left;
  }
`;

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
  <DialogHeaderWrapper {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooterWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
  <DialogFooterWrapper {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitleWrapper = styled(DialogPrimitive.Title)`
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
`;

const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>((props, ref) => <DialogTitleWrapper ref={ref} {...props} />);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// This is intended for screen readers only, so it's hidden from the visual layout.
const DialogDescriptionWrapper = styled(DialogPrimitive.Description)`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>((props, ref) => <DialogDescriptionWrapper ref={ref} {...props} />);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
