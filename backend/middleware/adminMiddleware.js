// /home/miss/OOTP/lab/gordeyut/backend/middleware/adminMiddleware.js

export const isAdmin = (req, res, next) => {
  // Проверяем, существует ли пользователь и является ли он администратором
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // Если роли нет или это не 'admin', возвращаем 403
  return res.status(403).json({ message: 'Доступ запрещен: требуется статус администратора' });
};