import {asyncTry, prefixError} from '@shared/lib/errorUtils.shared';
import {EXTENSION_FEED_SOURCE} from '@shared/lib/feedSources.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {FeedItem} from '@shared/types/feedItems.types';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useFeedItemsService} from '@sharedClient/hooks/feedItems.hooks';

import {useCurrentTab} from '@src/lib/tabs.ext';

const SaveCurrentUrlButton: React.FC = () => {
  const feedItemsService = useFeedItemsService();

  const {asyncState, setPending, setError, setSuccess} = useAsyncState<FeedItem>();

  const handleClick = async (): Promise<void> => {
    setPending();

    const tabResult = await asyncTry(async () => {
      const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
      return tab;
    });

    if (!tabResult.success) {
      setError(prefixError(tabResult.error, 'Error getting tab'));
      return;
    }

    const tab = tabResult.value;
    const tabUrl = tab.url;
    if (!tabUrl) {
      setError(new Error('No URL found for tab'));
      return;
    }

    const title = tab.title ?? 'TODO: Add title support';
    const addFeedItemResult = await feedItemsService.createFeedItemFromUrl({
      feedSource: EXTENSION_FEED_SOURCE,
      content: {
        url: tabUrl,
        title,
        // TODO: Set better initial values for these fields.
        description: null,
        outgoingLinks: [],
        summary: null,
      },
    });

    if (!addFeedItemResult.success) {
      setError(prefixError(addFeedItemResult.error, 'Error creating feed item'));
      return;
    }

    setSuccess(addFeedItemResult.value);
  };

  let statusContent: React.ReactNode | null;
  switch (asyncState.status) {
    case AsyncStatus.Idle:
      statusContent = null;
      break;
    case AsyncStatus.Pending:
      statusContent = <p>Saving URL...</p>;
      break;
    case AsyncStatus.Error:
      statusContent = <p style={{color: 'red'}}>Error saving URL: {asyncState.error.message}</p>;
      break;
    case AsyncStatus.Success:
      statusContent = (
        <p style={{color: 'green'}}>Feed item saved: {asyncState.value.content.title}</p>
      );
      break;
    default:
      assertNever(asyncState);
  }

  return (
    <>
      <button id="saveButton" onClick={handleClick}>
        Save Current URL
      </button>
      {statusContent}
    </>
  );
};

const CurrentTabContent: React.FC = () => {
  const currentTabState = useCurrentTab();

  switch (currentTabState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <p>Loading tab...</p>;
    case AsyncStatus.Error:
      return <p>Error loading tab: {currentTabState.error.message}</p>;
    case AsyncStatus.Success:
      return <p>URL: {currentTabState.value.url}</p>;
  }
};

export const App: React.FC = () => {
  return (
    <>
      <CurrentTabContent />
      <SaveCurrentUrlButton />
    </>
  );
};
