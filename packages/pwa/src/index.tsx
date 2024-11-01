import {createRoot} from 'react-dom/client';

import '@src/index.css';

import {App} from '@src/components/App';

const rootDiv = document.getElementById('root');
if (!rootDiv) {
  throw new Error('Root element not found');
}

const root = createRoot(rootDiv);
root.render(<App />);
