import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},

      // Allow all hosts or all Render subdomains:
      allowedHosts: true, 
      // OR explicitly:
      // allowedHosts: ['.onrender.com', 'shree-ganesh-mitra-mandal-1.onrender.com'],
    },
    preview: {
      // Also apply to vite preview if running in preview mode
      allowedHosts: true,
    },
  };
});