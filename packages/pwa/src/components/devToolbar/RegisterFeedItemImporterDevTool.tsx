import {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';

import {isValidUrl} from '@shared/lib/urls';

import {DevToolbarSectionType} from '@shared/types/devToolbar.types';
import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems.types';

import {useDevToolbarStore} from '@sharedClient/stores/DevToolbarStore';

import {useFeedItemsService} from '@sharedClient/services/feedItems.client';

import {Button, ButtonVariant} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';

const StatusText = styled.div<{readonly $isError?: boolean}>`
  font-size: 12px;
  color: ${({theme, $isError}) => ($isError ? theme.colors.error : theme.colors.success)};
`;

const FeedItemImporter: React.FC = () => {
  const feedItemsService = useFeedItemsService();

  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const handleAddItemToQueue = useCallback(
    async (urlToAdd: string) => {
      setStatus('Pending...');

      const trimmedUrl = urlToAdd.trim();
      if (!isValidUrl(trimmedUrl)) {
        setStatus('URL is not valid');
        return;
      }

      const addFeedItemResult = await feedItemsService.addFeedItem({
        url: trimmedUrl,
        source: FEED_ITEM_APP_SOURCE,
      });

      if (addFeedItemResult.success) {
        setStatus('URL saved successfully');
        setUrl('');
      } else {
        setStatus(`Error: ${addFeedItemResult.error}`);
      }
    },
    [feedItemsService]
  );

  return (
    <>
      <Input
        type="text"
        value={url}
        placeholder="Enter URL to test"
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button
        variant={ButtonVariant.Secondary}
        onClick={() =>
          void handleAddItemToQueue('https://jwn.gr/posts/migrating-from-gatsby-to-astro/')
        }
      >
        Import personal blog post
      </Button>
      <Button
        variant={ButtonVariant.Secondary}
        onClick={() => handleAddItemToQueue('https://www.youtube.com/watch?v=p_di4Zn4wz4')}
      >
        Import YouTube video
      </Button>
      <Button
        variant={ButtonVariant.Secondary}
        onClick={() =>
          handleAddItemToQueue('https://wattenberger.com/thoughts/the-internet-for-the-mind')
        }
      >
        Import complex blog post
      </Button>

      <Button variant={ButtonVariant.Secondary} onClick={() => handleAddItemToQueue(url)}>
        Test URL import
      </Button>
      {status ? <StatusText $isError={status.includes('Error')}>{status}</StatusText> : null}
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
    });
  }, [registerSection]);

  return null;
};
