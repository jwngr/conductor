import {useEffect} from 'react';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {Checkbox} from '@src/components/atoms/Checkbox';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Label} from '@src/components/atoms/Label';

const DebugDevToolbarSection: React.FC = () => {
  const toggleRouterDevTools = useDevToolbarStore((state) => state.toggleRouterDevTools);
  const shouldShowRouterDevTools = useDevToolbarStore((state) => state.shouldShowRouterDevTools);
  const toggleDebugActions = useDevToolbarStore((state) => state.toggleDebugActions);
  const shouldShowDebugActions = useDevToolbarStore((state) => state.shouldShowDebugActions);

  return (
    <FlexColumn>
      <FlexRow gap={2}>
        <Checkbox
          id="debugRouterDevTools"
          checked={shouldShowRouterDevTools}
          onClick={() => toggleRouterDevTools()}
        />
        <Label htmlFor="debugRouterDevTools">Show router dev tools</Label>
      </FlexRow>
      <FlexRow gap={2}>
        <Checkbox
          id="debugActions"
          checked={shouldShowDebugActions}
          onClick={() => toggleDebugActions()}
        />
        <Label htmlFor="debugActions">Show debug actions</Label>
      </FlexRow>
    </FlexColumn>
  );
};

export const RegisterDebugDevToolbarSection: React.FC = () => {
  const registerSection = useDevToolbarStore((state) => state.registerSection);

  useEffect(() => {
    return registerSection({
      sectionType: DevToolbarSectionType.Debug,
      title: 'Debug',
      renderSection: () => <DebugDevToolbarSection />,
      requiresAuth: false,
    });
  }, [registerSection]);

  return null;
};
