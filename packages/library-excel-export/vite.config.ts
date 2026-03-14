import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    solidPlugin(),
  ],
  build: {
    outDir: 'dist/public',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
