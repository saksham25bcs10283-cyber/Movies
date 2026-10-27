import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';
import { isTmdbConfigured } from './services/tmdb.js';

import authRoutes from './routes/authRoutes.js';
import tmdbRoutes from './routes/tmdbRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health & diagnostics endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  const tmdbReady = isTmdbConfigured();

  const isHealthy = dbStatus.connected && tmdbReady;

  res.json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'AfterFrame API',
    version: '1.0.0',
    tagline: "The film doesn't end at the credits.",
    database: {
      connected: dbStatus.connected,
      uriConfigured: dbStatus.uriConfigured,
      readyState: dbStatus.readyState,
      error: dbStatus.error
    },
    tmdb: {
      configured: tmdbReady,
      note: tmdbReady ? 'Live TMDB API connected' : 'Using curated offline catalog until TMDB credentials are added to server/.env'
    },
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/events', eventRoutes);

// 404 Route Handler for API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint Not Found',
    path: req.originalUrl,
    message: 'The requested AfterFrame API route does not exist.'
  });
});

// Production Client Static Asset Serving & SPA Fallback
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const indexHtmlPath = path.join(clientDistPath, 'index.html');

app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();

  if (fs.existsSync(indexHtmlPath)) {
    return res.sendFile(indexHtmlPath);
  }

  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AfterFrame API Server</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0d14; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
        .card { background: #161824; border: 1px solid #272a3d; border-radius: 16px; padding: 36px; max-width: 540px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
        h1 { color: #f59e0b; font-size: 24px; margin-bottom: 10px; font-weight: 700; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 14px; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
        .actions { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
        .btn { display: block; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .btn-primary { background: #f59e0b; color: #0c0d14; }
        .btn-primary:hover { background: #fbbf24; }
        .btn-secondary { background: #272a3d; color: #e2e8f0; }
        .btn-secondary:hover { background: #33374f; }
        code { background: #0c0d14; padding: 2px 6px; border-radius: 6px; color: #f59e0b; font-family: monospace; font-size: 13px; }
        .hint { margin-top: 22px; font-size: 12px; color: #64748b; border-top: 1px solid #272a3d; padding-top: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">● Backend Online</div>
        <h1>AfterFrame API Server</h1>
        <p>You have reached the backend API server running on port <code>${PORT}</code>.</p>
        <p>To view the <strong>AfterFrame Web App</strong> in development, open the Vite client dev server at port 5173:</p>
        <div class="actions">
          <a class="btn btn-primary" href="http://localhost:5173" target="_blank">Open AfterFrame App (http://localhost:5173)</a>
          <a class="btn btn-secondary" href="/api/health">Check API Health (/api/health)</a>
        </div>
        <p class="hint">
          Tip: Run <code>npm run dev:client</code> in a terminal to launch the frontend, or run <code>npm run build</code> in <code>client/</code> to serve production assets through this port.
        </p>
      </div>
    </body>
    </html>
  `);
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[AfterFrame Server] Running on http://localhost:${PORT}`);
    console.log(`[AfterFrame Server] TMDB configured: ${isTmdbConfigured()}`);
  });
}

export default app;
