import {Link} from '@tanstack/react-router';
import type React from 'react';

import {assertNever} from '@shared/lib/utils.shared';

import type {Task} from '@shared/types/utils.types';

import type {HeroAction} from '@sharedClient/types/heroActions.client.types';
import {HeroActionType} from '@sharedClient/types/heroActions.client.types';

import {Button} from '@src/components/atoms/Button';
import {FlexRow} from '@src/components/atoms/Flex';

import {DEFAULT_ROUTE} from '@src/routes';

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
    <Button variant="outline" asChild>
      <Link to={DEFAULT_ROUTE.to} search={{feedItemId: undefined}}>
        Back to default view
      </Link>
    </Button>
  );
};

const HeroActionButton: React.FC<{
  readonly action: HeroAction;
}> = ({action}) => {
  switch (action.type) {
    case HeroActionType.Refresh:
      return <RefreshActionButton />;
    case HeroActionType.DefaultRoute:
      return <DefaultRouteNavActionButton />;
    case HeroActionType.Custom:
      return (
        <Button variant={action.variant} onClick={action.onClick}>
          {action.text}
        </Button>
      );
    default:
      assertNever(action);
  }
};

export const HeroActionButtons: React.FC<{
  readonly actions: readonly HeroAction[];
}> = ({actions}) => {
  if (actions.length === 0) {
    return null;
  }

  return (
    <FlexRow gap={3}>
      {actions.map((action, i) => (
        <HeroActionButton key={`${i}-${action.type}`} action={action} />
      ))}
    </FlexRow>
  );
};
