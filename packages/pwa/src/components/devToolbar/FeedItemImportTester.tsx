import React, {useState} from 'react';
import {styled} from 'styled-components';

import {isValidUrl} from '@shared/lib/urls';

import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems.types';

import {useMaybeLoggedInUser} from '@shared/hooks/auth.hooks';

import {Button, ButtonVariant} from '@src/components/atoms/Button';
import {Input} from '@src/components/atoms/Input';

import {useMaybeFeedItemsService} from '@src/lib/feedItems.pwa';

const Status = styled.div<{readonly $isError?: boolean}>`
  font-size: 12px;
  color: ${({theme, $isError}) => ($isError ? theme.colors.error : theme.colors.success)};
`;

// TODO: Finish merging with `RegisterFeedItemImporterDevTool`.
export const FeedItemImportTester: React.FC = () => {
  // The dev toolbar is visible even when logged-out, so use hooks which don't require auth state.
  const feedItemsService = useMaybeFeedItemsService();
  const {isLoading: isLoadingLoggedInUser, loggedInUser} = useMaybeLoggedInUser();

  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const handleAddItemToQueue = async (urlToAdd: string) => {
    if (!feedItemsService) {
      setStatus(
        `Error: Feed items service not initialized (logged in user: ${JSON.stringify(loggedInUser)})`
      );
      return;
    }

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
  };

  // Only show the toolbar if we have auth state.
  if (isLoadingLoggedInUser || !loggedInUser) return null;

  return (
    <>
      <Input
        type="text"
        value={url}
        placeholder="Enter URL to test"
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button variant={ButtonVariant.Secondary} onClick={() => handleAddItemToQueue(url)}>
        Test URL import
      </Button>
      {status && <Status $isError={status.includes('Error')}>{status}</Status>}
    </>
  );
};
