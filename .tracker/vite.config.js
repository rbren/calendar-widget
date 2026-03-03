import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['oh.rbren.io'],
    proxy: {
      '/api': 'http://localhost:5111',
    },
  },
  build: {
    outDir: 'dist',
  },
});
