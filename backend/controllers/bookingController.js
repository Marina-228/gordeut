import pool from '../db.js';

export const createBooking = async (req, res) => {
  const { cottage_id, check_in_date, check_out_date } = req.body;
  const user_id = req.user.id; // Получаем ID юзера из нашего middleware 'protect'

  if (!cottage_id || !check_in_date || !check_out_date) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все поля: id коттеджа, даты въезда и выезда' });
  }

  try {
    // 1. Ищем коттедж, чтобы узнать его цену за сутки
    const cottageRes = await pool.query('SELECT price FROM cottages WHERE id = $1', [cottage_id]);
    if (cottageRes.rows.length === 0) {
      return res.status(404).json({ message: 'Выбранный коттедж не найден' });
    }
    const pricePerNight = cottageRes.rows[0].price;

    // 2. Считаем количество дней проживания
    const start = new Date(check_in_date);
    const end = new Date(check_out_date);
    const differenceInTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if (totalDays <= 0) {
      return res.status(400).json({ message: 'Дата выезда должна быть позже даты въезда' });
    }

    // 3. Считаем итоговую стоимость
    const total_price = pricePerNight * totalDays;

    // 4. Сохраняем бронь в базу со статусом 'pending' (ожидает подтверждения)
    const newBooking = await pool.query(
      'INSERT INTO bookings (user_id, cottage_id, check_in_date, check_out_date, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, cottage_id, check_in_date, check_out_date, total_price]
    );

    res.status(201).json({
      message: 'Коттедж успешно забронирован! 🎉 Ожидайте подтверждения.',
      booking: newBooking.rows[0]
    });

  } catch (err) {
    console.error('Ошибка при создании бронирования:', err.message);
    res.status(500).json({ message: 'Ошибка сервера при создании бронирования' });
  }
};