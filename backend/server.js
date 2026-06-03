import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import authRoutes from './routes/authRoutes.js';
import cottageRoutes from './routes/cottageRoutes.js'; 
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();

// Исправленный список разрешенных доменов
const allowedOrigins = [
    'http://localhost:5173', 
    'http://127.0.0.1:5173', 
    'https://gordeut-fexs-70dxocqn5-marina-s-projects12.vercel.app' 
];

app.use(cors({ 
    origin: (origin, callback) => {
        // Разрешаем запросы без origin (например, через Postman) или если origin в списке
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true 
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Подключение к БД
connectDB();

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/cottages', cottageRoutes); 
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.json({ message: "API сети коттеджей «Гордеют» работает!" });
});

export default app;