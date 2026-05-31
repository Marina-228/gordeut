import express from 'express'; 
// ИСПРАВЛЕНО: Добавили импорт searchCottages из контроллера
import { 
  getCottages, 
  getCottageById, 
  createCottage, 
  deleteCottage, 
  searchCottages 
} from '../controllers/cottageController.js';
import { protect } from '../middleware/authMiddleware.js'; 
import { isAdmin } from '../middleware/adminMiddleware.js'; 

const router = express.Router();

router.get('/search', searchCottages);

// Публичные маршруты (доступны всем пользователям и гостям)
router.get('/', getCottages);

// ВАЖНО И ИСПРАВЛЕНО: Маршрут /search обязан стоять ВЫШЕ, чем /:id
// Иначе Express примет слово "search" за динамический параметр ID!
router.get('/search', searchCottages);

router.get('/:id', getCottageById);

// Защищенный маршрут на создание (только для авторизованных админов)
router.post('/', protect, isAdmin, createCottage);

// Защищенный маршрут на удаление конкретного объекта по ID
router.delete('/:id', protect, isAdmin, deleteCottage);

export default router;