import app from '../backend/src/app.js';
import connectDB from '../backend/src/config/db.js';
import 'dotenv/config';

// Initialize DB connection for serverless environment
connectDB();

export default app;
