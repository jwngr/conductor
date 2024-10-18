import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import {theme} from '@shared/lib/theme';
import {Urls} from '@shared/lib/urls';
import {ViewType} from '@shared/types/query';

import {NotFoundScreen} from '@src/screens/404';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {ViewScreen} from '@src/screens/ViewScreen';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path={Urls.forRoot()} element={<ViewScreen viewType={ViewType.Untriaged} />} />
          <Route
            path={Urls.forView(ViewType.Saved)}
            element={<ViewScreen viewType={ViewType.Saved} />}
          />
          <Route
            path={Urls.forView(ViewType.Done)}
            element={<ViewScreen viewType={ViewType.Done} />}
          />
          <Route
            path={Urls.forView(ViewType.Trashed)}
            element={<ViewScreen viewType={ViewType.Trashed} />}
          />
          <Route
            path={Urls.forView(ViewType.All)}
            element={<ViewScreen viewType={ViewType.All} />}
          />
          <Route
            path={Urls.forView(ViewType.Starred)}
            element={<ViewScreen viewType={ViewType.Starred} />}
          />
          <Route
            path={Urls.forView(ViewType.Unread)}
            element={<ViewScreen viewType={ViewType.Unread} />}
          />
          <Route
            path={Urls.forView(ViewType.Today)}
            element={<ViewScreen viewType={ViewType.Today} />}
          />
          <Route path="/items/:feedItemId?/" element={<FeedItemScreen />} />
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};
