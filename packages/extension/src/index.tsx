import {createRoot} from 'react-dom/client';

import {App} from '@src/components/App.ext';

import '@src/globals.css';

const rootDiv = document.getElementById('root');
if (!rootDiv) {
  // eslint-disable-next-line no-restricted-syntax
  throw new Error('Root element not found');
}

const root = createRoot(rootDiv);
root.render(<App />);
