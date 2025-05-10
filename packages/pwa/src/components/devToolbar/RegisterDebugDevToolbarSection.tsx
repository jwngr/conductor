import {useEffect} from 'react';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {Checkbox} from '@src/components/atoms/Checkbox';
import {FlexColumn} from '@src/components/atoms/Flex';

const DebugDevToolbarSection: React.FC = () => {
  const toggleRouterDevTools = useDevToolbarStore((state) => state.toggleRouterDevTools);
  const shouldShowRouterDevTools = useDevToolbarStore((state) => state.shouldShowRouterDevTools);
  const toggleDebugActions = useDevToolbarStore((state) => state.toggleDebugActions);
  const shouldShowDebugActions = useDevToolbarStore((state) => state.shouldShowDebugActions);

  return (
    <FlexColumn>
      <label className="flex items-center gap-2">
        <Checkbox
          id="debugRouterDevTools"
          checked={shouldShowRouterDevTools}
          onClick={() => toggleRouterDevTools()}
        />
        <label htmlFor="debugRouterDevTools">Show router dev tools</label>
      </label>
      <label className="flex items-center gap-2">
        <Checkbox
          id="debugActions"
          checked={shouldShowDebugActions}
          onClick={() => toggleDebugActions()}
        />
        <label htmlFor="debugActions">Show debug actions</label>
      </label>
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
