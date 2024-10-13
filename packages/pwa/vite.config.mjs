import path from 'path';
import {fileURLToPath} from 'url';

import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import svgr from 'vite-plugin-svgr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), svgr()],
  envDir: path.resolve(__dirname, '../..'), // .env is at repo root.
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
