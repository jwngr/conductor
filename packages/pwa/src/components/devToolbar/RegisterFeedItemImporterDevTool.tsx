import {useCallback, useEffect, useState} from 'react';

import {isValidUrl} from '@shared/lib/urls';

import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems.types';

import {useDevToolbarStore} from '@shared/stores/DevToolbarStore';

import {useFeedItemsService} from '@src/lib/feedItems.pwa';

export const RegisterFeedItemImporterDevTool: React.FC = () => {
  const feedItemsService = useFeedItemsService();

  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const registerAction = useDevToolbarStore((state) => state.registerAction);

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
        setStatus('URL saved   successfully');
        setUrl('');
      } else {
        setStatus(`Error: ${addFeedItemResult.error}`);
      }
    },
    [feedItemsService]
  );

  useEffect(() => {
    const unsubscribeA = registerAction({
      actionId: 'IMPORT_PERSONAL_BLOG_POST',
      text: 'Import personal blog post',
      onClick: () => handleAddItemToQueue('https://jwn.gr/posts/migrating-from-gatsby-to-astro/'),
    });

    const unsubscribeB = registerAction({
      actionId: 'IMPORT_YOUTUBE_VIDEO',
      text: 'Import YouTube video',
      onClick: () => handleAddItemToQueue('https://www.youtube.com/watch?v=p_di4Zn4wz4'),
    });

    const unsubscribeC = registerAction({
      actionId: 'IMPORT_COMPLEX_BLOG_POST',
      text: 'Import complex blog post',
      onClick: () =>
        handleAddItemToQueue('https://wattenberger.com/thoughts/the-internet-for-the-mind'),
    });

    return () => {
      unsubscribeA();
      unsubscribeB();
      unsubscribeC();
    };
  }, [registerAction, handleAddItemToQueue, url]);

  return null;
};
