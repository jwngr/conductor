import {addDoc, collection, doc, setDoc} from 'firebase/firestore';
import {useState} from 'react';

import {FEED_ITEM_COLLECTION, IMPORT_QUEUE_COLLECTION} from '@shared/lib/constants';
import {makeFeedItem} from '@shared/lib/feedItems';
import {makeImportQueueItem} from '@shared/lib/importQueue';
import {ThemeColor} from '@shared/types/theme';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {firestore} from '@src/lib/firebase';

export const FeedItemAdder: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('');

  const handleAddItemToQueue = async (url: string) => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setStatus('Error: No URL provided');
      return;
    }

    setStatus('Pending...');

    try {
      const newItemsCollectionRef = collection(firestore, FEED_ITEM_COLLECTION);
      const importQueueCollectionRef = collection(firestore, IMPORT_QUEUE_COLLECTION);

      const feedItem = makeFeedItem(url, newItemsCollectionRef);
      const importQueueItem = makeImportQueueItem(url, feedItem.itemId);

      await Promise.all([
        setDoc(doc(newItemsCollectionRef, feedItem.itemId), feedItem),
        addDoc(importQueueCollectionRef, importQueueItem),
      ]);

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
