import {createRoot} from 'react-dom/client';

import '@src/globals.css';

import {App} from '@src/components/App.pwa';

import {setupGlobalErrorHandlers} from '@src/lib/errors.pwa';

const rootDiv = document.getElementById('root');
if (!rootDiv) {
  // eslint-disable-next-line no-restricted-syntax
  throw new Error('Root element not found');
}

setupGlobalErrorHandlers();

const root = createRoot(rootDiv);
root.render(<App />);
