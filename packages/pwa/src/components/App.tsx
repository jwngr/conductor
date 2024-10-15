import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import styled, {ThemeProvider} from 'styled-components';

import {theme} from '@shared/lib/theme';
import {ViewType} from '@shared/types/query';

import {NotFoundScreen} from '@src/screens/404';
import {FeedItemScreen} from '@src/screens/FeedItemScreen';
import {FeedItemAdder} from '@src/screens/HomeScreen';
import {ViewScreen} from '@src/screens/ViewScreen';

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
                <Route
                  path="/"
                  element={
                    <>
                      <ViewScreen viewType={ViewType.Untriaged} />
                      <FeedItemAdder />
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
            </MainContentWrapper>
          </FlexRow>
        </AppWrapper>
      </BrowserRouter>
    </ThemeProvider>
  );
};
