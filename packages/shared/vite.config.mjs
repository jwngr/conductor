import path, {resolve} from 'path';
import {fileURLToPath} from 'url';

import {defineConfig} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  envDir: path.resolve(__dirname, '../..'), // .env is at repo root.
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      formats: ['es', 'cjs'],
    },
    // This configuration is required to output `/dist` with the same hierarchy as `/src`.
    rollupOptions: {
      output: [],
    },
  },
  resolve: {
    alias: {
      // Despite this being in the shared package itself, prefer @shared imports over @src. This
      // makes code valid in any package when copy / pasting.
      '@shared': path.resolve(__dirname, './src'),
    },
  },
});
