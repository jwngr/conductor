import {useEffect, useState} from 'react';

import {asyncTry} from '@shared/lib/errors';

export function useCurrentTab() {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCurrentTab() {
      const tabResult = await asyncTry<chrome.tabs.Tab>(async () => {
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
