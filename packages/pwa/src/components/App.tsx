import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from 'styled-components';

import theme from '../resources/theme.json';
import {FeedItemScreen} from '../screens/FeedItemScreen';
import {HomeScreen} from '../screens/HomeScreen';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/items/:feedItemId?/" element={<FeedItemScreen />} />
          {/* Redirect unmatched routes to home page, replacing history stack. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};
