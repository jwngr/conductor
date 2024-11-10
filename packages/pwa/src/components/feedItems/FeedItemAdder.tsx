import {useState} from 'react';

import {isValidUrl} from '@shared/lib/urls';

import {feedItemsService} from '@shared/services/feedItemsService';

import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems.types';
import {ThemeColor} from '@shared/types/theme.types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@src/components/atoms/Dialog';
import {FlexColumn} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';

import {useLoggedInUser} from '@src/lib/users';

export const FeedItemAdder: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');
  const loggedInUser = useLoggedInUser();

  const handleAddItemToQueue = async (url: string) => {
    setStatus('Pending...');

    const trimmedUrl = url.trim();
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
    } else {
      setStatus(`Error saving URL: ${addFeedItemResult.error}`);
    }
  };

  return (
    <FlexColumn gap={12} align="flex-start">
      <Input
        type="text"
        value={url}
        placeholder="Enter URL"
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={() => handleAddItemToQueue(url)}>Add to import queue</button>
      <button
        onClick={() => handleAddItemToQueue('https://jwn.gr/posts/migrating-from-gatsby-to-astro/')}
      >
        Add personal blog post to import queue
      </button>
      {status ? (
        <Text as="p" color={ThemeColor.Green700} bold>
          {status}
        </Text>
      ) : null}
      <Dialog>
        <DialogTrigger>Open test dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>This is a test description</DialogDescription>
            {Array.from({length: 50}, (_, index) => (
              <Text key={index} as="p" color={ThemeColor.Red900} bold>
                This is a test dialog
              </Text>
            ))}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </FlexColumn>
  );
};
