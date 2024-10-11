import path, {resolve} from 'path';
import {fileURLToPath} from 'url';

import {defineConfig} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  envDir: path.resolve(__dirname, '../..'), // .env is at repo root.
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'ConductorShared',
      fileName: (format) => `conductor-shared.${format}.js`,
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
