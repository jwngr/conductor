import {useEffect} from 'react';

import {asyncTry} from '@shared/lib/errorUtils.shared';

import type {AsyncState} from '@shared/types/asyncState.types';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';

export function useCurrentTab(): AsyncState<chrome.tabs.Tab> {
  const {asyncState, setPending, setError, setSuccess} = useAsyncState<chrome.tabs.Tab>();

  useEffect(() => {
    async function fetchCurrentTab(): Promise<void> {
      setPending();
      const tabResult = await asyncTry(async () => {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        return tab;
      });

      if (!tabResult.success) {
        setError(tabResult.error);
        return;
      }

      setSuccess(tabResult.value);
    }

    void fetchCurrentTab();
  }, [setError, setPending, setSuccess]);

  return asyncState;
}
