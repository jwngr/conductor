import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import {theme} from '@shared/lib/theme';
import {Urls} from '@shared/lib/urls';

import {NotFoundScreen} from '@src/screens/404';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {FeedsScreen} from '@src/screens/FeedsScreen';
import {ViewScreen} from '@src/screens/ViewScreen';

export const App: React.FC = () => {
  const orderedNavItems = Urls.getOrderedNavItems();

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {orderedNavItems.map((item) => (
            <Route
              key={item.viewType}
              path={Urls.forView(item.viewType)}
              element={<ViewScreen viewType={item.viewType} />}
            />
          ))}
          <Route path={Urls.forFeedItem(':feedItemId')} element={<FeedItemScreen />} />
          <Route path={Urls.forFeeds()} element={<FeedsScreen />} />
          <Route path="*" element={<NotFoundScreen message="Page not found" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};
