import express from 'express';
// Добавляем deleteUserAccount в импорты
import { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  getSecretWordHint, 
  deleteUserAccount 
} from '../controllers/authController.js'; 
import { protect } from '../middleware/authMiddleware.js'; // Важно для защиты удаления

const router = express.Router();

// Маршруты аутентификации
router.post('/register', registerUser);
router.post('/login', loginUser); 

// Восстановление пароля
router.post('/forgot-password', forgotPassword); 

// Динамическое получение подсказки
router.get('/secret-word-hint', getSecretWordHint); 

// Удаление аккаунта (защищено middleware protect)
router.delete('/delete-account', protect, deleteUserAccount); 

export default router;