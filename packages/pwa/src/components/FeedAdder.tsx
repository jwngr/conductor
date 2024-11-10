import {useState} from 'react';

import {subscribeToFeed} from '@shared/lib/feedSubscriptions';
import {logger} from '@shared/lib/logger';

import {ThemeColor} from '@shared/types/theme';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Input} from '@src/components/atoms/Input';
import {Text} from '@src/components/atoms/Text';

export const FeedAdder: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const handleSubscribeToFeed = async (url: string) => {
    try {
      setStatus('Subscribing to feed...');
      await subscribeToFeed(url);
      setStatus('Subscribed to feed');
    } catch (error) {
      logger.error('Error subscribing to feed', {error, url});
      setStatus(`Error subscribing to feed: ${error}`);
    }
  };

  const handleUnsubscribeFromFeed = async (url: string) => {
    try {
      setStatus('Unsubscribing from feed...');
      // TODO: Remove feed subscription.
      setStatus('Unsubscribed from feed');
    } catch (error) {
      logger.error('Error unsubscribing from feed', {error, url});
      setStatus(`Error unsubscribing from feed: ${error}`);
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
      <button onClick={() => handleSubscribeToFeed(url)}>Subscribe to feed</button>
      <button onClick={() => handleUnsubscribeFromFeed(url)}>Unsubscribe from feed</button>
      {status ? (
        <Text as="p" color={ThemeColor.Green700} bold>
          {status}
        </Text>
      ) : null}
    </FlexColumn>
  );
};
