import express from 'express'; 
// Импортируем новый метод deleteCottage из контроллера
import { getCottages, getCottageById, createCottage, deleteCottage } from '../controllers/cottageController.js';
import { protect } from '../middleware/authMiddleware.js'; 
import { isAdmin } from '../middleware/adminMiddleware.js'; 

const router = express.Router();

// Публичные маршруты (доступны всем пользователям и гостям)
router.get('/', getCottages);
router.get('/:id', getCottageById);

// Защищенный маршрут на создание (только для авторизованных админов)
router.post('/', protect, isAdmin, createCottage);

// НОВОЕ: Защищенный маршрут на удаление конкретного объекта по ID
// Сначала protect проверит токен, затем isAdmin проверит роль, и только потом сработает deleteCottage
router.delete('/:id', protect, isAdmin, deleteCottage);

export default router;