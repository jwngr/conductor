import {useEffect, useState} from 'react';

export function useCurrentTab() {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCurrentTab() {
      try {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        setCurrentTab(tab);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch current tab'));
        setIsLoading(false);
      }
    }

    fetchCurrentTab();
  }, []);

  return {currentTab, isLoading, error};
}
