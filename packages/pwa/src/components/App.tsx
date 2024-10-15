import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import styled, {ThemeProvider} from 'styled-components';

import {theme} from '@shared/lib/theme';

import {NotFoundScreen} from '@src/screens/404';
import {AllScreen} from '@src/screens/AllScreen';
import {DoneScreen} from '@src/screens/DoneScreen';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {HomeScreen} from '@src/screens/HomeScreen';
import {SavedScreen} from '@src/screens/SavedScreen';
import {StarredScreen} from '@src/screens/StarredScreen';
import {UnreadScreen} from '@src/screens/UnreadScreen';

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
                <Route path="/starred" element={<StarredScreen />} />
                <Route path="/unread" element={<UnreadScreen />} />
                <Route path="/items/:feedItemId?/" element={<FeedItemScreen />} />
                <Route path="*" element={<NotFoundScreen />} />
              </Routes>
            </MainContentWrapper>
          </FlexRow>
        </AppWrapper>
      </BrowserRouter>
    </ThemeProvider>
  );
};
