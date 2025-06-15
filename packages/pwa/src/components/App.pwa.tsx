import {createRouter, RouterProvider} from '@tanstack/react-router';
import type React from 'react';
import {StrictMode} from 'react';

import {rootRoute} from '@src/routes/__root';
import {
  allViewRoute,
  catchAllRoute,
  doneViewRoute,
  experimentsRoute,
  feedItemRoute,
  feedSubscriptionsRoute,
  importRoute,
  savedViewRoute,
  signInRoute,
  signOutRoute,
  starredViewRoute,
  storiesRedirectRoute,
  storiesRoute,
  todayViewRoute,
  trashedViewRoute,
  unreadViewRoute,
  untriagedViewRoute,
} from '@src/routes/index';

const routeTree = rootRoute.addChildren([
  // Auth routes.
  signInRoute,
  signOutRoute,

  // View routes.
  allViewRoute,
  doneViewRoute,
  savedViewRoute,
  starredViewRoute,
  todayViewRoute,
  trashedViewRoute,
  unreadViewRoute,
  untriagedViewRoute,

  // Misc routes.
  experimentsRoute,
  feedItemRoute,
  feedSubscriptionsRoute,
  importRoute,

  // Story routes.
  // TODO: Nest these properly.
  storiesRoute,
  storiesRedirectRoute,

  // Catch-all route.
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
