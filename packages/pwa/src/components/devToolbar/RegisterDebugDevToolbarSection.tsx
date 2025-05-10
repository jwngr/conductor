import {useEffect} from 'react';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';

const DebugDevToolbarSection: React.FC = () => {
  const showDevTools = useDevToolbarStore((state) => state.showRouterDevTools);
  const toggleDevTools = useDevToolbarStore((state) => state.toggleRouterDevTools);

  return (
    <FlexColumn>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showDevTools}
          onChange={() => toggleDevTools()}
          className="h-4 w-4"
        />
        <Text as="p">{showDevTools ? 'Hide' : 'Show'} router dev tools</Text>
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
