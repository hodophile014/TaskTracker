import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5264',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: 'http://localhost:5264',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

