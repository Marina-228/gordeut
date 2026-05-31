import express from 'express';
// ИМПОРТИРУЕМ ВСЕ 3 ФУНКЦИИ
import { createBooking, getMyBookings, cancelBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.patch('/:id/cancel', protect, cancelBooking); // ТЕПЕРЬ ОНА БУДЕТ ВИДНА!

export default router;