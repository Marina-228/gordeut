import pool from '../db.js';

// 1. Получение всех домиков
export const getCottages = async (req, res) => {
  try {
    // Используем "title AS name", чтобы если в базе колонка называется title, фронтенд получал привычный name
    const result = await pool.query(`
      SELECT 
        id, 
        title AS name, 
        rooms, 
        type, 
        min_guests, 
        max_guests, 
        region, 
        city, 
        address, 
        description, 
        price_per_night, 
        media_urls 
      FROM cottages 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при загрузке домиков:', err);
    res.status(500).json({ message: 'Ошибка при загрузке домиков' });
  }
};

// 2. Получение одного домика по ID
export const getCottageById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        title AS name, 
        rooms, 
        type, 
        min_guests, 
        max_guests, 
        region, 
        city, 
        address, 
        description, 
        price_per_night, 
        media_urls,
        breakfast_included,
        bed_type
      FROM cottages 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Домик не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Ошибка при получении домика с ID ${id}:`, err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// 3. Создание нового домика
export const createCottage = async (req, res) => {
  const { 
    name, rooms, type, min_guests, max_guests, 
    region, city, address, description, price, image,
    breakfast_included, bed_type 
  } = req.body;

  if (!name || !price || !region || !city) {
    return res.status(400).json({ message: 'Заполните обязательные поля: Название, Цена, Область и Город' });
  }

  try {
    const parsedRooms = parseInt(rooms) || 1;
    const parsedMinGuests = parseInt(min_guests) || 1;
    const parsedMaxGuests = parseInt(max_guests) || 1;
    const parsedPrice = parseFloat(price) || 0;
    
    const mediaUrlsArray = image ? [image] : [];

    // ВНИМАНИЕ: Здесь вместо name пишем title, так как Postgres ожидает название колонки title
    const newCottage = await pool.query(
      `INSERT INTO cottages (
        title, rooms, type, min_guests, max_guests, has_discount, 
        region, city, address, breakfast_included, bed_type, 
        price_per_night, description, media_urls
      ) VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING id, title AS name, price_per_night, media_urls`,
      [
        name, // Твой React присылает 'name', записываем его в 'title' базы данных
        parsedRooms, 
        type || 'house', 
        parsedMinGuests, 
        parsedMaxGuests, 
        region, 
        city, 
        address || '', 
        breakfast_included || false, 
        bed_type || 'Не указано', 
        parsedPrice, 
        description || '', 
        mediaUrlsArray
      ]
    );

    res.status(201).json({ 
      success: true,
      message: 'Объявление успешно сохранено! 🚀', 
      data: newCottage.rows[0] 
    });
  } catch (err) {
    console.error('Ошибка при добавлении дома в БД:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера базы данных',
      error: err.message 
    });
  }
};

// 4. НОВОЕ: Удаление домика (Экспортируем для роутера)
export const deleteCottage = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Сначала проверяем, есть ли такой объект в БД
    const checkResult = await pool.query('SELECT * FROM cottages WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Объект не найден в базе данных' 
      });
    }

    // Удаляем
    await pool.query('DELETE FROM cottages WHERE id = $1', [id]);

    // Отдаем обязательный флаг success: true, который ждет фронтенд
    res.json({ 
      success: true, 
      message: 'Объект успешно удален' 
    });
  } catch (err) {
    console.error(`Ошибка при удалении домика с ID ${id}:`, err);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при удалении объекта', 
      error: err.message 
    });
  }
};