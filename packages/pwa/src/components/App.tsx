import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import theme from '../resources/theme.json';
import {AllScreen} from '../screens/AllScreen';
import {DoneScreen} from '../screens/DoneScreen';
import {FeedItemScreen} from '../screens/FeedItemScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {SavedScreen} from '../screens/SavedScreen';
import {AppHeader} from './AppHeader';
import {FlexRow} from './atoms/Flex';
import {LeftSidebar} from './LeftSidebar';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppHeader />
        <FlexRow align="flex-start">
          <LeftSidebar />
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/saved" element={<SavedScreen />} />
            <Route path="/done" element={<DoneScreen />} />
            <Route path="/all" element={<AllScreen />} />
            <Route path="/items/:feedItemId?/" element={<FeedItemScreen />} />
            {/* Redirect unmatched routes to home page, replacing history stack. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FlexRow>
      </BrowserRouter>
    </ThemeProvider>
  );
};
