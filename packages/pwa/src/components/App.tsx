import {collection} from 'firebase/firestore';
import React, {Suspense, useEffect} from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import {firestore} from '../lib/firebase';
import {initImportQueue} from '../lib/importQueue';
import theme from '../resources/theme.json';
import {ItemScreen} from '../screens/HomeScreen';
import {HomeScreen} from '../screens/ItemScreen';

// import {SavedItem, SavedItemId} from '../types/savedItems';

export const App: React.FC = () => {
  useEffect(() => {
    const go = async () => {
      const importQueue = initImportQueue(collection(firestore, 'importQueue'));
      const item = await importQueue.read('7Rt9MCx0DquHmoJ1AUv8');
      // eslint-disable-next-line no-console
      console.log('ITEM:', item);
    };
    go();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/items/:itemId?/" element={<ItemScreen />} />
          {/* Redirect unmatched routes to home page, replacing history stack. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

// export const SavedItemComponent: React.FC<{
//   readonly savedItemId: SavedItemId;
// }> = ({savedItemId}) => {
//   const savedItemService = useSavedItemService();
//   const savedItem = savedItemService.get(savedItemId);

//   return (
//     <ThemeProvider theme={theme}>
//       <h1>{savedItem.title}</h1>
//       <p></p>
//     </ThemeProvider>
//   );
// };

// export const ArticleSavedItem: React.FC<{
//   readonly savedItem: ArticleSavedItem;
// }> = ({savedItem}) => {
//   return (
//     <ThemeProvider theme={theme}>
//       <h1>{savedItem.title}</h1>
//       <video src={savedItem.videoUrl} />
//     </ThemeProvider>
//   );
// };

// export const VideoSavedItem: React.FC<{
//   readonly savedItem: SavedItem;
// }> = ({savedItem}) => {
//   return (
//     <ThemeProvider theme={theme}>
//       <h1>{savedItem.title}</h1>
//       <video src={savedItem.videoUrl} />
//     </ThemeProvider>
//   );
// };
