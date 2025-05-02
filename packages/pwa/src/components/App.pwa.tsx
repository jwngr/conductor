import {createRouter, RouterProvider} from '@tanstack/react-router';
import type React from 'react';
import {StrictMode} from 'react';

import {Toaster} from '@src/components/atoms/Toaster';

import {rootRoute} from '@src/routes/__root';
import {
  catchAllRoute,
  feedItemRoute,
  feedSubscriptionsRoute,
  importRoute,
  signInRoute,
  signOutRoute,
  storiesRoute,
  viewRoutes,
} from '@src/routes/index';

const routeTree = rootRoute.addChildren([
  signInRoute,
  signOutRoute,
  storiesRoute,
  ...viewRoutes,
  feedItemRoute,
  feedSubscriptionsRoute,
  importRoute,
  catchAllRoute,
]);

const router = createRouter({routeTree});

export const App: React.FC = () => {
  return (
    <StrictMode>
      <RouterProvider router={router} />
      <Toaster richColors />
    </StrictMode>
  );
};
