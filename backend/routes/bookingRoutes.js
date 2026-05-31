import express from 'express';
import { createBooking, getMyBookings, cancelBooking, getBookedDates } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/cottages/:id/booked-dates', getBookedDates);

// ИСПРАВЛЕНО: 
// 1. Убрали префикс '/api/bookings' (он лишний).
// 2. Используем 'delete', так как на фронтенде у вас API.delete()
router.delete('/:id', protect, cancelBooking); 

export default router;