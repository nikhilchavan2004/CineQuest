const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./config/database');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const movieRoutes = require('./routes/movieRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

function createApp() {
  const app = express();
  const configuredClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const allowedClientUrls = new Set([
    configuredClientUrl,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedClientUrls.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Origin is not allowed by CORS'));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Movie Discovery API',
    });
  });

  app.use('/api', healthRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/wishlist', wishlistRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  connectDatabase().catch((error) => {
    console.error('Database initialization error:', error.message);
  });

  return app;
}

module.exports = { createApp };
