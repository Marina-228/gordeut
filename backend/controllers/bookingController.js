import pool from '../db.js';

export const getMyBookings = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(`
      SELECT 
        b.*, 
        c.name as cottage_name, 
        c.media_urls -- берем массив фото
      FROM bookings b
      JOIN cottages c ON b.cottage_id = c.id
      WHERE b.user_id = $1
      ORDER BY b.start_date DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const createBooking = async (req, res) => {
  // Получаем данные, которые присылает фронтенд
  const { cottage_id, check_in_date, check_out_date } = req.body;
  const user_id = req.user.id;

  if (!cottage_id || !check_in_date || !check_out_date) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
  }

  try {
    // 1. Ищем коттедж
    const cottageRes = await pool.query('SELECT price_per_night FROM cottages WHERE id = $1', [cottage_id]);
    
    if (cottageRes.rows.length === 0) {
      return res.status(404).json({ message: 'Выбранный коттедж не найден' });
    }
    
    const pricePerNight = parseFloat(cottageRes.rows[0].price_per_night);

    // 2. Считаем количество дней
    const start = new Date(check_in_date);
    const end = new Date(check_out_date);
    const differenceInTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if (totalDays <= 0) {
      return res.status(400).json({ message: 'Дата выезда должна быть позже даты въезда' });
    }

    // 3. Считаем итоговую стоимость
    const total_price = pricePerNight * totalDays;

    // 4. ВСТАВКА В БД (Используем имена колонок строго из вашего скриншота: start_date, end_date)
    const newBooking = await pool.query(
      `INSERT INTO bookings (user_id, cottage_id, start_date, end_date, total_price, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [user_id, cottage_id, check_in_date, check_out_date, total_price, 'pending']
    );

    res.status(201).json({
      message: 'Коттедж успешно забронирован! 🎉 Ожидайте подтверждения.',
      booking: newBooking.rows[0]
    });

  } catch (err) {
    console.error('Ошибка при создании бронирования:', err);
    res.status(500).json({ message: 'Ошибка сервера при создании бронирования', error: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  const { id } = req.params; // ID бронирования из URL
  const userId = req.user.id; // ID пользователя из middleware (protect)

  console.log("Отмена брони ID:", id, "для пользователя:", userId);

  try {
    // Выполняем UPDATE только если запись принадлежит этому пользователю
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      ['cancelled', id, userId]
    );

    // Если ничего не обновилось (rowCount === 0), значит:
    // 1. Брони с таким ID не существует
    // 2. Или она принадлежит другому пользователю (безопасность)
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Бронирование не найдено или доступ запрещен' });
    }

    res.json({ message: 'Бронирование успешно отменено', booking: result.rows[0] });
    
  } catch (err) {
    console.error("Ошибка базы данных:", err);
    res.status(500).json({ message: 'Ошибка сервера при отмене' });
  }
};