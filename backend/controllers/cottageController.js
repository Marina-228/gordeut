import pool from '../db.js';

// 1. Получение всех домиков
export const getCottages = async (req, res) => {
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
        media_urls 
      FROM cottages 
      ORDER BY id DESC
    `);
    res.json(result.rows);
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
    const { city, region, type, max_guests, start_date, end_date } = req.query;

    // ИСПРАВЛЕНО: Явно перечисляем колонки, используем name вместо title
    let queryText = `
      SELECT 
        id, name, rooms, type, min_guests, max_guests, 
        region, city, address, description, price_per_night, media_urls 
      FROM cottages 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramIndex = 1;

    // Фильтр по городу
    if (city) {
      queryText += ` AND city ILIKE $${paramIndex}`;
      queryParams.push(`%${city}%`);
      paramIndex++;
    }

    // Фильтр по области
    if (region) {
      queryText += ` AND region = $${paramIndex}`;
      queryParams.push(region);
      paramIndex++;
    }

    // Фильтр по типу жилья
    if (type) {
      queryText += ` AND type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    // Фильтр по вместимости гостей
    if (max_guests) {
      queryText += ` AND max_guests >= $${paramIndex}`;
      queryParams.push(parseInt(max_guests));
      paramIndex++;
    }

    // Фильтрация дат
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

    // Резервный фолбек (тоже с явным перечислениемname)
    if (err.message.includes('bookings') || err.message.includes('relation') || err.message.includes('getaddrinfo')) {
      try {
        console.log('Выполняется резервный поиск вариантов...');
        let backupQuery = `
          SELECT id, name, rooms, type, min_guests, max_guests, region, city, address, description, price_per_night, media_urls 
          FROM cottages WHERE 1=1
        `;
        const backupParams = [];
        let bIdx = 1;

        if (city) { backupQuery += ` AND city ILIKE $${bIdx}`; backupParams.push(`%${city}%`); bIdx++; }
        if (region) { backupQuery += ` AND region = $${bIdx}`; backupParams.push(region); bIdx++; }
        if (max_guests) { backupQuery += ` AND max_guests >= $${bIdx}`; backupParams.push(parseInt(max_guests)); bIdx++; }
        
        backupQuery += ` ORDER BY id DESC`;
        const backupResult = await pool.query(backupQuery, backupParams);
        return res.json(backupResult.rows);
      } catch (backupErr) {
        return res.status(500).json({ message: 'Критическая ошибка базы данных', error: backupErr.message });
      }
    }

    res.status(500).json({ message: 'Ошибка сервера при поиске объектов', error: err.message });
  }
};