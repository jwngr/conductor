import React, {useState} from 'react';
import {styled} from 'styled-components';

import {isValidUrl} from '@shared/lib/urls';

import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems.types';

import {Input} from '@src/components/atoms/Input';
import {Button} from '@src/components/devToolbar/Button';

import {useMaybeLoggedInUser} from '@src/lib/auth.pwa';
import {feedItemsService} from '@src/lib/feedItems.pwa';

const Status = styled.div<{isError?: boolean}>`
  font-size: 12px;
  color: ${({theme, isError}) => (isError ? theme.colors.error : theme.colors.success)};
`;

export const FeedItemImportTester: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const {isLoading: isLoadingLoggedInUser, loggedInUser} = useMaybeLoggedInUser();

  if (isLoadingLoggedInUser || !loggedInUser) return null;

  const handleAddItemToQueue = async (urlToAdd: string) => {
    setStatus('Pending...');

    const trimmedUrl = urlToAdd.trim();
    if (!isValidUrl(trimmedUrl)) {
      setStatus('URL is not valid');
      return;
    }

    const addFeedItemResult = await feedItemsService.addFeedItem({
      url: trimmedUrl,
      source: FEED_ITEM_APP_SOURCE,
      userId: loggedInUser.userId,
    });

    if (addFeedItemResult.success) {
      setStatus('URL saved successfully');
      setUrl('');
    } else {
      setStatus(`Error: ${addFeedItemResult.error}`);
    }
  };

  return (
    <>
      <Input
        type="text"
        value={url}
        placeholder="Enter URL to test"
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={() => handleAddItemToQueue(url)}>Test URL import</Button>
      <Button
        onClick={() => handleAddItemToQueue('https://jwn.gr/posts/migrating-from-gatsby-to-astro/')}
      >
        Test blog import
      </Button>
      {status && <Status isError={status.includes('Error')}>{status}</Status>}
    </>
  );
};
