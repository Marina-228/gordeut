import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;
  let token1;

  // 1. Проверка наличия заголовка и его формата
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // console.log("request:", req);
      token1 = req.headers.authorization; //
      token = token1.split(' ')[1];
      // ДОБАВЛЕНА ПРОВЕРКА: если токен — это строка "undefined" или "null"
      if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ message: 'Не авторизован: токен пуст ' + String(token) });
      }

      // 2. Верификация
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      return next(); // Обязательно return, чтобы не идти дальше
    } catch (error) {
      // Добавим логирование ошибки на сервере, чтобы понять причину
      console.error("JWT Verification Error:", error.message);
      
      // Если токен просрочен, можно вернуть более понятный статус
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Токен истек' });
      }
      
      return res.status(401).json({ message: 'Не авторизован: токен недействителен' });
    }
  }

  // 3. Если заголовок отсутствует или не содержит Bearer
  return res.status(401).json({ message: 'Не авторизован: отсутствует заголовок авторизации' });
};