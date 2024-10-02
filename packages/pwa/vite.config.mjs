import path from 'path';
import {fileURLToPath} from 'url';

import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // '@shared': path.resolve(__dirname, '../shared/src'),
      '@conductor/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
