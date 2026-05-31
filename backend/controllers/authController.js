import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

// ==========================================
// 1. РЕГИСТРАЦИЯ НОВОГО ПОЛЬЗОВАТЕЛЯ
// ==========================================
export const registerUser = async (req, res) => {
  const { name, email, password, phone, secretWord, secretWordHint } = req.body;

  if (!name || !email || !password || !secretWord) {
    return res.status(400).json({ message: 'Пожалуйста, заполните обязательные поля' });
  }

  // Новая продвинутая валидация надежности пароля (1-в-1 как на фронтенде)
  if (password.length < 6) {
    return res.status(400).json({ message: 'Пароль слишком короткий. Минимальная длина — 6 символов.' });
  }
  if (!/[A-ZА-Я]/.test(password)) {
    return res.status(400).json({ message: 'Пароль должен содержать хотя бы одну заглавную букву.' });
  }
  if (!/[a-zа-я]/.test(password)) {
    return res.status(400).json({ message: 'Пароль должен содержать хотя бы одну строчную букву.' });
  }
  if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(password)) {
    return res.status(400).json({ message: 'Пароль должен содержать хотя бы один спецсимвол (!@#$...).' });
  }

  try {
    // 1. Проверяем наличие email
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // 2. Считаем количество пользователей, чтобы понять, кто будет админом
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCountResult.rows[0].count);
    
    // Если пользователей 0, значит этот — первый, назначаем роль 'admin'
    const role = userCount === 0 ? 'admin' : 'user';

    // 3. Хэшируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Записываем в базу, передавая роль
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, secret_word, secret_word_hint, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role',
      [name, email, hashedPassword, phone || null, secretWord, secretWordHint || null, role] 
    );

    const user = newUser.rows[0];

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: `Пользователь зарегистрирован как ${role}! 🎉`,
      token,
      user
    });

  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ==========================================
// 2. ВХОД (АВТОРИЗАЦИЯ) СУЩЕСТВУЮЩЕГО ПОЛЬЗОВАТЕЛЯ
// ==========================================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Пожалуйста, введите email и пароль' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Вход успешно выполнен! 👋',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error('Ошибка при входе:', err.message);
    res.status(500).json({ message: 'Ошибка сервера при попытке входа' });
  }
};

// ==========================================
// 3. ПОЛУЧЕНИЕ ПОДСКАЗКИ КЛЮЧЕВОГО СЛОВА НА ЛЕТУ
// ==========================================
export const getSecretWordHint = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email не указан' });
  }

  try {
    const result = await pool.query('SELECT secret_word_hint FROM users WHERE email = $1', [email]);

    // Если email в базе нет, возвращаем null ради безопасности, чтобы не раскрывать чужие ящики
    if (result.rows.length === 0) {
      return res.json({ hint: null });
    }

    res.json({ hint: result.rows[0].secret_word_hint });
  } catch (err) {
    console.error('Ошибка при получении подсказки:', err.message);
    res.status(500).json({ message: 'Ошибка сервера при поиске подсказки' });
  }
};

// ==========================================
// 4. ВОССТАНОВЛЕНИЕ ПАРОЛЯ ПО КЛЮЧЕВОМУ СЛОВУ
// ==========================================
export const forgotPassword = async (req, res) => {
  const { email, secretWord, newPassword } = req.body;

  if (!email || !secretWord || !newPassword) {
    return res.status(400).json({ message: 'Заполните все поля: Email, Ключевое слово и Новый пароль' });
  }

  // Обновленная строгая валидация нового пароля перед его сохранением в БД
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Новый пароль слишком короткий. Минимальная длина — 6 символов.' });
  }
  if (!/[A-ZА-Я]/.test(newPassword)) {
    return res.status(400).json({ message: 'Новый пароль должен содержать хотя бы одну заглавную букву.' });
  }
  if (!/[a-zа-я]/.test(newPassword)) {
    return res.status(400).json({ message: 'Новый пароль должен содержать хотя бы одну строчную букву.' });
  }
  if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(newPassword)) {
    return res.status(400).json({ message: 'Новый пароль должен содержать хотя бы один спецсимвол (!@#$...).' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь с таким email не зарегистрирован' });
    }

    const user = result.rows[0];

    if (!user.secret_word || user.secret_word.toLowerCase().trim() !== secretWord.toLowerCase().trim()) {
      return res.status(400).json({ message: 'Неверное ключевое слово! Доступ отклонен.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedNewPassword, user.id]
    );

    res.status(200).json({ 
      message: 'Пароль успешно изменен! 🎉 Теперь вы можете войти, используя новый пароль.' 
    });

  } catch (err) {
    console.error('Ошибка при сбросе пароля:', err.message);
    res.status(500).json({ message: 'Ошибка сервера при сбросе пароля' });
  }
};

  // ==========================================
// 5. УДАЛЕНИЕ АККАУНТА
// ==========================================
export const deleteUserAccount = async (req, res) => {
  try {
    // req.user.id приходит из middleware 'protect', 
    // который декодирует токен и достает ID пользователя
    const userId = req.user.id;

    // Выполняем удаление
    const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ message: 'Аккаунт успешно удален' });
  } catch (err) {
    console.error('Ошибка при удалении аккаунта:', err.message);
    res.status(500).json({ message: 'Ошибка сервера при удалении аккаунта' });
  }
};