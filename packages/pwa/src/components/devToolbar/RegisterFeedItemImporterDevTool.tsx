import {useCallback, useEffect, useState} from 'react';

import {isValidUrl} from '@shared/lib/urls.shared';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';
import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {useFeedItemsService} from '@sharedClient/services/feedItems.client';

import {Button} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';

const StatusText: React.FC<{
  readonly isError: boolean;
  readonly children: React.ReactNode;
}> = ({isError, children}) => {
  return (
    <Text as="p" className={`text-xs ${isError ? 'text-error' : 'text-success'}`}>
      {children}
    </Text>
  );
};

const FeedItemImporter: React.FC = () => {
  const feedItemsService = useFeedItemsService();

  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const handleAddItemToQueue = useCallback(
    async (urlToAdd: string) => {
      setStatus('Pending...');

      const trimmedUrl = urlToAdd.trim();
      if (!isValidUrl(trimmedUrl)) {
        setStatus('Error: URL is not valid');
        return;
      }

      const addFeedItemResult = await feedItemsService.createFeedItem({
        url: trimmedUrl,
        feedItemSource: FEED_ITEM_APP_SOURCE,
        title: `[IMPORT] ${trimmedUrl}`,
      });

      if (addFeedItemResult.success) {
        setStatus('URL saved successfully');
        setUrl('');
      } else {
        setStatus(`Error adding item to import queue: ${addFeedItemResult.error.message}`);
      }
    },
    [feedItemsService]
  );

  const renderImportFeedItemButton = useCallback(
    ({url, title}: {readonly url: string; readonly title: string}) => (
      <Button key={url} variant="outline" onClick={async () => void handleAddItemToQueue(url)}>
        {title}
      </Button>
    ),
    [handleAddItemToQueue]
  );

  return (
    <>
      <Input
        type="text"
        value={url}
        placeholder="Enter URL to test"
        onChange={(e) => setUrl(e.target.value)}
      />

      {renderImportFeedItemButton({
        url: 'https://dev.to/jsmanifest/14-beneficial-tips-to-write-cleaner-code-in-react-apps-1gcf',
        title: 'React article',
      })}
      {renderImportFeedItemButton({
        url: 'https://jwn.gr/posts/migrating-from-gatsby-to-astro/',
        title: 'Personal blog post',
      })}
      {renderImportFeedItemButton({
        url: 'https://www.youtube.com/watch?v=p_di4Zn4wz4',
        title: 'YouTube video',
      })}
      {renderImportFeedItemButton({
        url: 'https://xkcd.com/927/',
        title: 'XKCD comic',
      })}

      <Button variant="outline" onClick={async () => void handleAddItemToQueue(url)}>
        Test URL import
      </Button>
      {status ? <StatusText isError={status.includes('Error')}>{status}</StatusText> : null}
    </>
  );
};

export const RegisterFeedItemImporterDevToolbarSection: React.FC = () => {
  const registerSection = useDevToolbarStore((state) => state.registerSection);

  useEffect(() => {
    return registerSection({
      sectionType: DevToolbarSectionType.FeedItemImporter,
      title: 'Feed item importer',
      renderSection: () => <FeedItemImporter />,
      requiresAuth: true,
    });
  }, [registerSection]);

  return null;
};
