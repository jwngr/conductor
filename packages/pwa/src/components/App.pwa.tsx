import {createRouter, RouterProvider} from '@tanstack/react-router';
import type React from 'react';
import {StrictMode} from 'react';

import {rootRoute} from '@src/routes/__root';
import {
  allViewRoute,
  catchAllRoute,
  doneViewRoute,
  feedItemRoute,
  feedSubscriptionsRoute,
  importRoute,
  savedViewRoute,
  signInRoute,
  signOutRoute,
  starredViewRoute,
  storiesDefaultRoute,
  storiesRoute,
  todayViewRoute,
  trashedViewRoute,
  unreadViewRoute,
  untriagedViewRoute,
} from '@src/routes/index';

const routeTree = rootRoute.addChildren([
  signInRoute,
  signOutRoute,
  storiesDefaultRoute,
  storiesRoute,
  allViewRoute,
  todayViewRoute,
  untriagedViewRoute,
  unreadViewRoute,
  starredViewRoute,
  savedViewRoute,
  doneViewRoute,
  trashedViewRoute,
  feedItemRoute,
  feedSubscriptionsRoute,
  importRoute,
  catchAllRoute,
]);

const router = createRouter({routeTree});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const App: React.FC = () => {
  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
};
