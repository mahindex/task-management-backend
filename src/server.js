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

// 🔹 CREATE EXPRESS APP
const app = express();

// 🔹 MIDDLEWARE
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://task-management-frontend-puce.vercel.app',
  ],
}));
app.use(express.json());

// 🔹 ROUTES (THIS IS CRITICAL)
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// 🔹 ERROR HANDLERS (MUST BE AFTER ROUTES)
app.use(notFound);
app.use(errorMiddleware);

// 🔹 START SERVER (RENDER USES 10000)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
