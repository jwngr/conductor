import {FEED_ITEM_COLLECTION, IMPORT_QUEUE_COLLECTION} from '@shared/lib/constants';
import {makeImportQueueItem} from '@shared/lib/importQueue';
import {makeFeedItem} from '@shared/lib/items';
import {ViewType} from '@shared/types/query';
import {addDoc, collection, doc, setDoc} from 'firebase/firestore';
import {useState} from 'react';
import styled from 'styled-components';

import {FlexColumn} from '../components/atoms/Flex';
import {Text} from '../components/atoms/Text';
import {View} from '../components/views/View';
import {firestore} from '../lib/firebase';

const HomeScreenWrapper = styled.div`
  padding: 20px;
`;

export const HomeScreen: React.FC = () => {
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
    <HomeScreenWrapper>
      <View viewType={ViewType.Inbox} />

      <br />

      <FlexColumn gap={12} align="flex-start">
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button onClick={() => handleAddItemToQueue(url)}>Add to import queue</button>
        <Text as="p" color="green" bold>
          {status}
        </Text>
      </FlexColumn>
    </HomeScreenWrapper>
  );
};
