import {useCallback, useEffect, useState} from 'react';

import {PWA_FEED} from '@shared/lib/feeds.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import {DevToolbarSectionType} from '@shared/types/devToolbar.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useFeedItemsService} from '@sharedClient/hooks/feedItems.hooks';

import {Button} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';
import {P} from '@src/components/atoms/Text';

import {firebaseService} from '@src/lib/firebase.pwa';

const StatusText: React.FC<{
  readonly isError?: boolean;
  readonly children: React.ReactNode;
}> = ({isError, children}) => {
  return (
    <P error={isError} success={!isError}>
      {children}
    </P>
  );
};

const FeedItemImporter: React.FC = () => {
  const feedItemsService = useFeedItemsService({firebaseService});

  const [urlInputValue, setUrlInputValue] = useState('');
  const {asyncState, setPending, setError, setSuccess} = useAsyncState<undefined>();

  const handleAddItemToQueue = useCallback(
    async (maybeUrl: string) => {
      const trimmedUrl = maybeUrl.trim();
      if (!isValidUrl(trimmedUrl)) {
        setError(new Error('URL is not valid'));
        return;
      }

      setPending();

      const feedItem = feedItemsService.makeFeedItemFromUrl({
        origin: PWA_FEED,
        url: trimmedUrl,
        title: trimmedUrl,
        // These values are not provided in the dev toolbar importer.
        description: null,
        summary: null,
      });

      const addFeedItemResult = await feedItemsService.addFeedItem(feedItem);
      if (!addFeedItemResult.success) {
        setError(addFeedItemResult.error);
        return;
      }

      setUrlInputValue('');
      setSuccess(undefined);
    },
    [feedItemsService, setError, setPending, setSuccess]
  );

  const renderImportFeedItemButton = useCallback(
    ({url, title}: {readonly url: string; readonly title: string}) => (
      <Button key={url} variant="outline" onClick={async () => void handleAddItemToQueue(url)}>
        {title}
      </Button>
    ),
    [handleAddItemToQueue]
  );

  let statusText: React.ReactNode | null;
  switch (asyncState.status) {
    case AsyncStatus.Idle:
      statusText = null;
      break;
    case AsyncStatus.Pending:
      statusText = <StatusText>Importing...</StatusText>;
      break;
    case AsyncStatus.Error:
      statusText = <StatusText isError>{asyncState.error.message}</StatusText>;
      break;
    case AsyncStatus.Success:
      statusText = <StatusText>Success</StatusText>;
      break;
    default:
      assertNever(asyncState);
  }

  return (
    <>
      {renderImportFeedItemButton({
        url: 'https://dev.to/jsmanifest/14-beneficial-tips-to-write-cleaner-code-in-react-apps-1gcf',
        title: 'React article',
      })}
      {renderImportFeedItemButton({
        url: 'https://jwn.gr/posts/migrating-from-gatsby-to-astro/',
        title: 'Personal blog post',
      })}
      {renderImportFeedItemButton({
        url: 'https://wattenberger.com/thoughts/the-internet-for-the-mind',
        title: 'Complex blog post',
      })}
      {renderImportFeedItemButton({
        url: 'https://www.youtube.com/watch?v=p_di4Zn4wz4',
        title: 'YouTube video',
      })}
      {renderImportFeedItemButton({
        url: 'https://xkcd.com/927/',
        title: 'XKCD comic',
      })}
      {renderImportFeedItemButton({
        url: 'https://publicdomainreview.org/collection/chinese-fishes/',
        title: 'Fish images',
      })}

      <Input
        type="text"
        value={urlInputValue}
        placeholder="Enter URL to test"
        onChange={(e) => setUrlInputValue(e.target.value)}
      />
      <Button variant="outline" onClick={async () => void handleAddItemToQueue(urlInputValue)}>
        Test URL import
      </Button>

      {statusText}
    </>
  );
};

export const RegisterFeedItemImporterDevToolbarSection: React.FC = () => {
  const registerSection = useDevToolbarStore((state) => state.registerSection);

  useEffect(() => {
    const unregister = registerSection({
      sectionType: DevToolbarSectionType.FeedItemImporter,
      title: 'Feed item importer',
      renderSection: () => <FeedItemImporter />,
      requiresAuth: true,
    });

    return () => unregister();
  }, [registerSection]);

  return null;
};
