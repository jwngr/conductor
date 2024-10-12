import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import styled, {ThemeProvider} from 'styled-components';

import {theme} from '@shared/lib/theme';

import {AllScreen} from '@src/screens/AllScreen';
import {DoneScreen} from '@src/screens/DoneScreen';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {HomeScreen} from '@src/screens/HomeScreen';
import {SavedScreen} from '@src/screens/SavedScreen';

import {AppHeader} from './AppHeader';
import {FlexColumn, FlexRow} from './atoms/Flex';
import {LeftSidebar} from './LeftSidebar';

const AppWrapper = styled(FlexColumn)`
  height: 100%;
  width: 100%;
`;

const MainContentWrapper = styled.div`
  flex: 1;
  overflow: auto;
`;

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppWrapper>
          <AppHeader />
          <FlexRow align="stretch" flex style={{overflow: 'hidden'}}>
            <LeftSidebar />
            <MainContentWrapper>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/saved" element={<SavedScreen />} />
                <Route path="/done" element={<DoneScreen />} />
                <Route path="/all" element={<AllScreen />} />
                <Route path="/items/:feedItemId?/" element={<FeedItemScreen />} />
                {/* Redirect unmatched routes to home page, replacing history stack. */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainContentWrapper>
          </FlexRow>
        </AppWrapper>
      </BrowserRouter>
    </ThemeProvider>
  );
};
