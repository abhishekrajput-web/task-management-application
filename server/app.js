import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { requestLogger } from './utils/logger.js';
import { healthCheck } from './utils/healthCheck.js';
import { notFoundHandler, globalErrorHandler } from './utils/errorHandlers.js';

// Load environment variables
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/', healthCheck);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and then start server
const startServer = async () => {
  try {
    // Wait for database connection
    await connectDB();
    
    // Start server only after DB is connected
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();