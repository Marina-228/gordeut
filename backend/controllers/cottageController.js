import pool from '../db.js';

// 1. Получение всех домиков
export const getCottages = async (req, res) => {
  try {
    // 1. Считываем параметры из запроса (по умолчанию 1 страница, 3 элемента)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const offset = (page - 1) * limit;

    // 2. Узнаем общее количество коттеджей (нужно для фронтенда, чтобы понимать сколько всего страниц)
    const countResult = await pool.query('SELECT COUNT(*) FROM cottages');
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // 3. Добавляем LIMIT и OFFSET в существующий SQL-запрос
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
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
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]); // Передаем параметры для пагинации

    // 4. Возвращаем объект с данными и мета-информацией о страницах
    res.json({
      data: result.rows,
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems
    });

  } catch (err) {
    console.error('Ошибка при загрузке домиков:', err);
    res.status(500).json({ message: 'Ошибка при загрузке домиков', error: err.message });
  }
};

// 2. Получение одного домика по ID
export const getCottageById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
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
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
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

    const newCottage = await pool.query(
      `INSERT INTO cottages (
        name, rooms, type, min_guests, max_guests, has_discount, 
        region, city, address, breakfast_included, bed_type, 
        price_per_night, description, media_urls
      ) VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING id, name, price_per_night, media_urls`,
      [
        name, 
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

// 4. Удаление домика
export const deleteCottage = async (req, res) => {
  const { id } = req.params;
  
  try {
    const checkResult = await pool.query('SELECT * FROM cottages WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Объект не найден в базе данных' 
      });
    }

    await pool.query('DELETE FROM cottages WHERE id = $1', [id]);

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

// 5. Поиск и фильтрация домиков (Заменили * на явный выбор полей с name)
export const searchCottages = async (req, res) => {
  try {
    const { city, region, type, max_guests, start_date, end_date, query } = req.query;

    // Базовый запрос
    let queryText = `
      SELECT id, name, rooms, type, min_guests, max_guests, 
             region, city, address, description, price_per_night, media_urls 
      FROM cottages 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramIndex = 1;

    // 1. Текстовый поиск (по названию или описанию)
    if (query) {
      queryText += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${query}%`);
      paramIndex++;
    }

    // 2. Фильтр по городу
    if (city) {
      queryText += ` AND city ILIKE $${paramIndex}`;
      queryParams.push(`%${city}%`);
      paramIndex++;
    }

    // 3. Фильтр по области
    if (region) {
      queryText += ` AND region = $${paramIndex}`;
      queryParams.push(region);
      paramIndex++;
    }

    // 4. Фильтр по типу
    if (type) {
      queryText += ` AND type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    // 5. Фильтр по гостям
    if (max_guests) {
      queryText += ` AND max_guests >= $${paramIndex}`;
      queryParams.push(parseInt(max_guests));
      paramIndex++;
    }

    // 6. Фильтрация дат (доступность)
    if (start_date && end_date) {
      queryText += ` AND id NOT IN (
        SELECT cottage_id FROM bookings 
        WHERE NOT (end_date <= $${paramIndex} OR start_date >= $${paramIndex + 1})
      )`;
      queryParams.push(start_date, end_date);
      paramIndex += 2;
    }

    queryText += ` ORDER BY id DESC`;

    const result = await pool.query(queryText, queryParams);
    res.json(result.rows);

  } catch (err) {
    console.error('Ошибка при поиске домиков:', err);
    res.status(500).json({ message: 'Ошибка сервера при поиске объектов', error: err.message });
  }
};
