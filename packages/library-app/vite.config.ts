import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solidPlugin()],
  publicDir: 'src/public',
  build: {
    outDir: 'dist/public',
    emptyOutDir: false, // Don't empty as we also build worker to dist
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/frontend')
    }
  }
});
