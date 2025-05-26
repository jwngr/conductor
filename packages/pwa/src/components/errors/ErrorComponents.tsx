import type React from 'react';

import {DEFAULT_NAV_ITEM} from '@shared/lib/navItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {Task} from '@shared/types/utils.types';

import {
  ErrorScreenActionType,
  type ErrorScreenAction,
} from '@sharedClient/types/errors.client.types';

import {Button} from '@src/components/atoms/Button';
import {FlexRow} from '@src/components/atoms/Flex';
import {NavItemLink} from '@src/components/nav/NavItemLink';

const RefreshActionButton: React.FC = () => {
  const handleRefresh: Task = () => window.location.reload();

  return (
    <Button variant="default" onClick={handleRefresh}>
      Refresh
    </Button>
  );
};

const DefaultRouteNavActionButton: React.FC = () => {
  return (
    <NavItemLink navItemId={DEFAULT_NAV_ITEM.id}>
      <Button variant="outline">Go to {DEFAULT_NAV_ITEM.title}</Button>
    </NavItemLink>
  );
};

const ErrorActionButton: React.FC<{
  readonly action: ErrorScreenAction;
}> = ({action}) => {
  switch (action.type) {
    case ErrorScreenActionType.Refresh:
      return <RefreshActionButton />;
    case ErrorScreenActionType.DefaultRoute:
      return <DefaultRouteNavActionButton />;
    case ErrorScreenActionType.Custom:
      return (
        <Button variant={action.variant} onClick={action.onClick}>
          {action.text}
        </Button>
      );
    default:
      assertNever(action);
  }
};

export const ErrorActionButtons: React.FC<{
  readonly actions: readonly ErrorScreenAction[];
}> = ({actions}) => {
  return (
    <FlexRow gap={3}>
      {actions.map((action, i) => (
        <ErrorActionButton key={`${i}-${action.type}`} action={action} />
      ))}
    </FlexRow>
  );
};

export const TechnicalDetailsSection: React.FC<{
  readonly error: Error;
}> = ({error}) => {
  if (!error.stack) {
    return null;
  }

  return (
    <details className="w-full">
      <summary className="text-neutral-6 hover:text-neutral-7 focus:text-neutral-7 cursor-pointer list-none text-sm outline-none select-none [&[open]]:mb-2">
        <span className="inline-block w-4 transition-transform duration-200 [details[open]_&]:rotate-90">
          ▶
        </span>
        Show technical details
      </summary>
      <pre className="bg-neutral-1 text-neutral-7 max-h-40 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
        {error.stack}
      </pre>
    </details>
  );
};
