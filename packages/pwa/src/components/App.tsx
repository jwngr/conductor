import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import {theme} from '@shared/lib/theme';
import {ViewType} from '@shared/types/query';

import {NotFoundScreen} from '@src/screens/404';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {ViewScreen} from '@src/screens/ViewScreen';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <ViewScreen viewType={ViewType.Untriaged} />
              </>
            }
          />
          <Route path="/saved" element={<ViewScreen viewType={ViewType.Saved} />} />
          <Route path="/done" element={<ViewScreen viewType={ViewType.Done} />} />
          <Route path="/all" element={<ViewScreen viewType={ViewType.All} />} />
          <Route path="/starred" element={<ViewScreen viewType={ViewType.Starred} />} />
          <Route path="/unread" element={<ViewScreen viewType={ViewType.Unread} />} />
          <Route path="/items/:feedItemId?/" element={<FeedItemScreen />} />
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};
