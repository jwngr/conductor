import {useState} from 'react';

import {feedItemsService} from '@shared/lib/feedItemsServiceInstance';
import {ThemeColor} from '@shared/types/theme';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';

export const FeedItemAdder: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const handleAddItemToQueue = async (url: string) => {
    setStatus('Pending...');

    try {
      await feedItemsService.addFeedItem(url);
      setStatus('URL saved successfully');
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <FlexColumn gap={12} align="flex-start">
      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button onClick={() => handleAddItemToQueue(url)}>Add to import queue</button>
      <Text as="p" color={ThemeColor.Green700} bold>
        {status}
      </Text>
    </FlexColumn>
  );
};
