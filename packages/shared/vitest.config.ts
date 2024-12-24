import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: [
      {
        find: '@shared',
        // This must be an absolute path, not a relative path.
        replacement: new URL('./src/', import.meta.url).pathname,
      },
    ],
  },
});
