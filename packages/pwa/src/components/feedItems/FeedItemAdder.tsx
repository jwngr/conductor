import {useState} from 'react';

import {feedItemsService} from '@shared/services/feedItemsService';
import {FEED_ITEM_APP_SOURCE} from '@shared/types/feedItems';
import {ThemeColor} from '@shared/types/theme';

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

export const FeedItemAdder: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const handleAddItemToQueue = async (url: string) => {
    setStatus('Pending...');

    try {
      await feedItemsService.addFeedItem({url, source: FEED_ITEM_APP_SOURCE});
      setStatus('URL saved successfully');
    } catch (error) {
      setStatus(`Error: ${error}`);
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
