import { defineConfig } from 'vite';
import { handleApiRequest } from './server/apiRouter.js';

export default defineConfig({
  plugins: [
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            try {
              const handled = await handleApiRequest(req, res);
              if (handled) return;
            } catch (e) {
              console.error('Error handling API middleware:', e);
            }
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api')) {
            try {
              const handled = await handleApiRequest(req, res);
              if (handled) return;
            } catch (e) {
              console.error('Error handling API middleware:', e);
            }
          }
          next();
        });
      },
    },
  ],
});

