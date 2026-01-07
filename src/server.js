import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';
import notFound from './middleware/notFound.js';
import errorMiddleware from './middleware/errorMiddleware.js';

dotenv.config();

// 🔹 CONNECT DATABASE
connectDB();

// 🔹 CREATE EXPRESS APP (MUST BE BEFORE app.use)
const app = express();

// 🔹 MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔹 ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 🔹 START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
