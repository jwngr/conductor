import theme from '@src/resources/theme.json';
import {AllScreen} from '@src/screens/AllScreen';
import {DoneScreen} from '@src/screens/DoneScreen';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {HomeScreen} from '@src/screens/HomeScreen';
import {SavedScreen} from '@src/screens/SavedScreen';
import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import styled, {ThemeProvider} from 'styled-components';

import {AppHeader} from './AppHeader';
import {FlexColumn, FlexRow} from './atoms/Flex';
import {LeftSidebar} from './LeftSidebar';

const AppWrapper = styled(FlexColumn)`
  height: 100%;
  width: 100%;
`;

const MainContentWrapper = styled.div`
  flex: 1;
`;

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppWrapper>
          <AppHeader />
          <FlexRow align="flex-start" flex>
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
