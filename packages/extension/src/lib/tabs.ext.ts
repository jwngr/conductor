import {useEffect, useState} from 'react';

import {asyncTry} from '@shared/lib/errorUtils.shared';

interface UseCurrentTabReturnValue {
  readonly currentTab: chrome.tabs.Tab | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function useCurrentTab(): UseCurrentTabReturnValue {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCurrentTab(): Promise<void> {
      const tabResult = await asyncTry(async () => {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        return tab;
      });
      if (tabResult.success) {
        setCurrentTab(tabResult.value);
        setIsLoading(false);
      } else {
        setError(tabResult.error);
        setIsLoading(false);
      }
    }

    void fetchCurrentTab();
  }, []);

  return {currentTab, isLoading, error};
}
