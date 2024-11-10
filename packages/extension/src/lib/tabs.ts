import {useEffect, useState} from 'react';

import {asyncTry} from '@shared/lib/errors';

export function useCurrentTab() {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCurrentTab() {
      const fetchCurrentTabResult = await asyncTry(async () => {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        setCurrentTab(tab);
      });
      if (fetchCurrentTabResult.success) {
        setIsLoading(false);
      } else {
        setError(fetchCurrentTabResult.error);
        setIsLoading(false);
      }
    }

    fetchCurrentTab();
  }, []);

  return {currentTab, isLoading, error};
}
