import { defineConfig } from 'vite';

// No SSL plugin needed — http://localhost is treated as a "secure context"
// by all browsers, so camera/mic getUserMedia works perfectly on plain HTTP.

export default defineConfig(({ command }) => ({
  server: {
    port: 5173,
    host: true,
    hmr: { protocol: 'ws' },
    proxy: command === 'serve' ? {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    } : {}
  }
}));

