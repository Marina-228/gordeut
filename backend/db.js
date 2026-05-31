import pg from 'pg';
import dotenv from 'dotenv';

// Подключаем чтение переменных из .env, чтобы увидеть DATABASE_URL
dotenv.config();

const { Pool } = pg;

// Настраиваем пул подключений к Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Этот параметр обязателен для безопасного подключения к облаку Supabase
  }
});

// Функция-тест, которую мы вызываем в server.js при старте
export const connectDB = async () => {
  console.log('🔄 Пробуем подключиться к Supabase...');
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`📡 База данных Supabase успешно подключена! Время сервера БД: ${res.rows[0].now}`);
  } catch (err) {
    console.error('❌ Ошибка подключения к базе данных:', err.message);
    console.error('Проверь, правильный ли пароль указан в файле .env');
  }
};

// Экспортируем пул по умолчанию, чтобы делать запросы в других файлах (например, при регистрации)
export default pool;