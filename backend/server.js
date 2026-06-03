import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import authRoutes from './routes/authRoutes.js';
import cottageRoutes from './routes/cottageRoutes.js'; 
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ 
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://vercel.com/marina-s-projects12/gordeut-yrod/HDpLmj8TqEP5F9YDQL1FnQbyTsC8'], 
    credentials: true 
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Подключение к базе данных
connectDB();

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/cottages', cottageRoutes); 
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.json({ message: "API сети коттеджей «Гордеют» работает!" });
});

// ДЛЯ VERCEL: не используем app.listen, экспортируем app как модуль
export default app;