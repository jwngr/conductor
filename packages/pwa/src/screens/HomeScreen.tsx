import {FEED_ITEM_COLLECTION, IMPORT_QUEUE_COLLECTION} from '@shared/lib/constants';
import {makeImportQueueItem} from '@shared/lib/importQueue';
import {makeFeedItem} from '@shared/lib/items';
import {addDoc, collection, doc, setDoc} from 'firebase/firestore';
import {useState} from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import {FlexColumn} from '../components/atoms/Flex';
import {Text} from '../components/atoms/Text';
import {firestore} from '../lib/firebase';
import {useFeedItems} from '../lib/items';

const HomeScreenWrapper = styled.div`
  padding: 20px;
`;

export const HomeScreen: React.FC = () => {
  const {feedItems, isLoading} = useFeedItems();
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

  let itemsContent: React.ReactNode;

  if (isLoading) {
    itemsContent = <div>Loading...</div>;
  } else if (feedItems.length === 0) {
    itemsContent = <div>No feed items</div>;
  } else {
    itemsContent = (
      <ul>
        {feedItems.map((feedItem) => {
          return (
            <li key={feedItem.itemId}>
              <Link to={`/items/${feedItem.itemId}`}>
                <Text as="p" bold>
                  {feedItem.url}
                </Text>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <HomeScreenWrapper>
      {itemsContent}
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
