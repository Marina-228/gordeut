import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  // 1. Проверяем наличие заголовка Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Извлекаем токен
      token = req.headers.authorization.split(' ')[1];

      // 3. Верифицируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      /* Важный момент: 
         В декодированном токене у нас теперь есть id и role 
         (так как мы их закладывали при генерации в authController).
         Присваиваем их объекту req.user.
      */
      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Не авторизован: токен недействителен' });
    }
  }

  // 4. Если токена нет вообще
  if (!token) {
    return res.status(401).json({ message: 'Не авторизован: отсутствует токен' });
  }
};