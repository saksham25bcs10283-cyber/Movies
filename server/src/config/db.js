import mongoose from 'mongoose';

let dbStatus = {
  connected: false,
  connecting: false,
  error: null,
  uriConfigured: false
};

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI?.trim();
  if (uri) {
    // Strip accidental surrounding single or double quotes
    uri = uri.replace(/^["']|["']$/g, '').trim();
  }

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    dbStatus.uriConfigured = false;
    dbStatus.connected = false;
    dbStatus.error = 'MongoDB URI not configured in server/.env (or still contains placeholder values)';
    console.warn('[MongoDB] ' + dbStatus.error);
    return false;
  }

  dbStatus.uriConfigured = true;
  dbStatus.connecting = true;

  try {
    mongoose.set('strictQuery', false);
    const connectOptions = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      tls: true,
    };
    await mongoose.connect(uri, connectOptions);

    dbStatus.connected = true;
    dbStatus.connecting = false;
    dbStatus.error = null;
    console.log('[MongoDB] Connected successfully to Atlas/database');

    // Remove positively identified temporary test event
    try {
      const { Event } = await import('../models/Event.js');
      const testEvent = await Event.findOne({
        title: 'Friday Night IMAX Screening',
        venue: 'PVR INOX Palladium Screen 1'
      });
      if (testEvent) {
        await Event.deleteOne({ _id: testEvent._id });
        console.log('[Cleanup] Positively identified and removed temporary test event:', testEvent.title);
      }
    } catch (cleanupErr) {
      console.warn('[Cleanup] Event check error:', cleanupErr.message);
    }

    return true;
  } catch (err) {
    dbStatus.connected = false;
    dbStatus.connecting = false;
    dbStatus.error = err.message || 'Connection failed';
    console.error('[MongoDB] Connection error:', err.message);
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  dbStatus.connected = false;
  console.warn('[MongoDB] Disconnected from database');
});

mongoose.connection.on('error', (err) => {
  dbStatus.connected = false;
  dbStatus.error = err.message;
  console.error('[MongoDB] Runtime error:', err.message);
});

export const getDbStatus = () => ({
  ...dbStatus,
  readyState: mongoose.connection.readyState
});

export const requireDB = (req, res, next) => {
  if (!dbStatus.connected || mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database Unavailable',
      message: dbStatus.uriConfigured 
        ? 'MongoDB is currently disconnected or unavailable. Please verify network access.'
        : 'MongoDB connection string is not configured in server/.env. Please add your MONGODB_URI.',
      details: dbStatus.error
    });
  }
  next();
};
