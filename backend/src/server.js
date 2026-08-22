const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

// Database
const { testConnection } = require('./config/db');

// Routes
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const tripsRoutes = require('./routes/trips.routes');
const publicRoutes = require('./routes/public.routes');
const catalogRoutes = require('./routes/catalog.routes');

// Error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();

const PORT = Number(process.env.PORT) || 5000;

// ===============================
// CORS
// ===============================

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // (Postman, curl, server-to-server requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

// ===============================
// Body Parser
// ===============================

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ===============================
// Basic Test Route
// ===============================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GlobeTrotter Backend API is running'
  });
});

// ===============================
// Health / Database Test
// ===============================

app.get('/api/health', async (req, res) => {
  try {
    await testConnection();

    res.json({
      success: true,
      message: 'GlobeTrotter API and database are running'
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);

    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// ===============================
// API Routes
// ===============================

app.use('/api', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', tripsRoutes);
app.use('/api', publicRoutes);
app.use('/api', catalogRoutes);

// ===============================
// Error Handler
// ===============================

app.use(errorHandler);

// ===============================
// Start Server
// ===============================

async function startServer() {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log(`GlobeTrotter Backend running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to connect to MySQL database.');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();