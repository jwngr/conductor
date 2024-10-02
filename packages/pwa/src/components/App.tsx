import {readFromImportQueue} from '@conductor/shared/lib/importQueue';
import React, {useEffect} from 'react';
import {ThemeProvider} from 'styled-components';

import theme from '../resources/theme.json';

// import {SavedItem, SavedItemId} from '../types/savedItems';

export const App: React.FC = () => {
  useEffect(() => {
    const go = async () => {
      const item = await readFromImportQueue('7Rt9MCx0DquHmoJ1AUv8');
      // eslint-disable-next-line no-console
      console.log('ITEM:', item);
    };
    go();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <p>Hi I'm just testing...</p>
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
