import {createRoot} from 'react-dom/client';

import App from '@src/components/App';

import '@src/index.css';

const rootDiv = document.getElementById('root');
if (!rootDiv) {
  throw new Error('Root element not found');
}

const root = createRoot(rootDiv);
root.render(<App />);
