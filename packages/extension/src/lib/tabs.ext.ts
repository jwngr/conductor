import {useEffect, useState} from 'react';

import {asyncTry} from '@shared/lib/errorUtils.shared';

interface CurrentTabState {
  readonly currentTab: chrome.tabs.Tab | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

const INITIAL_CURRENT_TAB_STATE: CurrentTabState = {
  currentTab: null,
  isLoading: true,
  error: null,
};

export function useCurrentTab(): CurrentTabState {
  const [state, setState] = useState<CurrentTabState>(INITIAL_CURRENT_TAB_STATE);

  useEffect(() => {
    async function fetchCurrentTab(): Promise<void> {
      const tabResult = await asyncTry(async () => {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        return tab;
      });
      if (tabResult.success) {
        setState({
          currentTab: tabResult.value,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          currentTab: null,
          isLoading: false,
          error: tabResult.error,
        });
      }
    }

    void fetchCurrentTab();
  }, []);

  return state;
}
