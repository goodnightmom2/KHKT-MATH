import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {handleApiRequest, readDatabase} from './server/apiHandler';

function optimathBackendPlugin(): Plugin {
  return {
    name: 'optimath-backend-api',
    configureServer(server) {
      readDatabase();
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleApiRequest(req, res);
        if (!handled) {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      readDatabase();
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleApiRequest(req, res);
        if (!handled) {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/KHKT-MATH/',
    plugins: [react(), tailwindcss(), optimathBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              ignored: ['**/server/data/**', '**/server/uploads/**'],
            },
    },
  };
});
