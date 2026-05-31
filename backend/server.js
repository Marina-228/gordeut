import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import authRoutes from './routes/authRoutes.js';
import cottageRoutes from './routes/cottageRoutes.js'; 
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ 
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
    credentials: true 
}));

// ИСПРАВЛЕНО: Увеличили лимит, чтобы сервер не ругался на «Payload Too Large» при загрузке фото
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Подключение к базе данных
connectDB();

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/cottages', cottageRoutes); 
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Добро пожаловать в API сети коттеджей «Гордеют»! Сервер успешно запущен. 🚀" });
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` Server is running on port ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`=========================================`);
});