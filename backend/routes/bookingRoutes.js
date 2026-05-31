import express from 'express';
import { createBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js'; // Наш пограничник

const router = express.Router();

// Маршрут защищен! Сначала сработает protect, и только если токен ок — выполнится createBooking
router.post('/', protect, createBooking);

export default router;