import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// ИСПРАВЛЕНО: Точный импорт Placemark без опечаток
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps'; 
import API from '../api/axios';

export default function Search() {
  const navigate = useNavigate();

  // Состояния для фильтров поиска
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState('1');
  
  // Данные из БД и отфильтрованные данные
  const [cottages, setCottages] = useState([]);
  const [filteredCottages, setFilteredCottages] = useState([]);
  const [loading, setLoading] = useState(false);

  const belarusRegions = [
    'Брестская область',
    'Витебская область',
    'Гомельская область',
    'Гродненская область',
    'Минская область',
    'Могилевская область'
  ];

  const loadAllCottages = async () => {
    setLoading(true);
    try {
      const response = await API.get('/cottages/search');
      setCottages(response.data);
      setFilteredCottages(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке каталога для поиска:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCottages();
  }, []);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const params = {};
      if (city) params.city = city;
      if (region) params.region = region;
      if (guests) params.max_guests = guests;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
          alert('Дата выезда должна быть позже даты заезда!');
          setLoading(false);
          return;
        }
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const response = await API.get('/cottages/search', { params });
      setFilteredCottages(response.data);

    } catch (err) {
      console.error('Ошибка фильтрации:', err);
      // Мягкое уведомление без жесткого падения
      console.log('Проверьте подключение к БД или названия колонок (name вместо title)');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCottage = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот объект?')) return;
    try {
      await API.delete(`/cottages/${id}`);
      alert('Объект успешно удален');
      setFilteredCottages(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Ошибка при удалении домика:', err);
      alert('Не удалось удалить объект');
    }
  };

  return (
    /* ИСПРАВЛЕНО: Убрали жесткий overflow: hidden. Теперь страница плавно скроллится вниз, если домиков много */
    <div style={{ 
      padding: '15px', 
      fontFamily: 'sans-serif', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: '#f9f9f9',
      minHeight: '100vh'
    }}>
      
      <h1 style={{ color: '#222', fontSize: '22px', margin: '0 0 15px 0', textAlign: 'center' }}>
        Поиск уютного отдыха
      </h1>

      {/* --- БЛОК ФИЛЬТРОВ (Слегка уменьшен по высоте) --- */}
      <form onSubmit={handleSearchSubmit} style={{
        background: '#fff', padding: '12px 20px', borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex',
        flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end', marginBottom: '15px'
      }}>
        
        <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Область</label>
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc', background: '#fcfcfc', fontSize: '13px' }}
          >
            <option value="">Вся Беларусь</option>
            {belarusRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Город / Деревня</label>
          <input 
            type="text" 
            placeholder="Например: Браслав" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
          />
        </div>

        <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Заезд</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
          />
        </div>

        <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Выезд</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
          />
        </div>

        <div style={{ flex: '1 1 80px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>Гости</label>
          <input 
            type="number" 
            min="1" 
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '13px' }}
          />
        </div>

        <button type="submit" style={{
          background: '#598850', color: '#fff', border: 'none',
          padding: '8px 20px', borderRadius: '10px', fontWeight: 'bold',
          cursor: 'pointer', transition: 'background 0.2s', fontSize: '14px', height: '32px'
        }}
          onMouseOver={(e) => e.target.style.background = '#476d3f'}
          onMouseOut={(e) => e.target.style.background = '#598850'}
        >
          Найти
        </button>
      </form>

      {/* --- ИСПРАВЛЕННАЯ КАРТА --- */}
<div style={{ 
  width: '100%', 
  height: '240px', 
  borderRadius: '16px', 
  overflow: 'hidden', 
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
  background: 'transparent', // Убеждаемся, что фон контейнера прозрачен
  marginBottom: '20px',
  display: 'flex' 
}}>
  <YMaps query={{ lang: 'ru_RU' }}>
    <Map 
      defaultState={{ center: [53.9006, 27.5590], zoom: 7 }} 
      style={{ width: '100%', height: '100%', background: 'transparent' }} // И здесь тоже
      options={{
        background: 'transparent' // Дополнительно для самой карты
      }}
    >
      {/* ... ваши метки */}
    </Map>
  </YMaps>
</div>

      {/* --- СЕТКА ДОМИКОВ: КАРТОЧКИ УВЕЛИЧЕНЫ --- */}
      <div style={{ width: '100%', marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px' }}>
          Найдено вариантов: {filteredCottages.length}
        </h3>
        
       {/* --- РАСТЯНУТАЯ СЕТКА ДОМИКОВ --- */}
<div style={{ 
  display: 'grid', 
  /* "1fr 1fr 1fr" принудительно делит пространство на 3 равные части во всю ширину */
  gridTemplateColumns: 'repeat(3, 1fr)', 
  gap: '20px', 
  marginTop: '20px',
  width: '100%' // Гарантирует, что сетка займет 100% ширины родителя
}}>
  {cottages.map((cottage) => (
    <div key={cottage.id} style={{
      background: '#fff',
      borderRadius: '20px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      /* Убеждаемся, что карточка не сжимается меньше нужного */
      minWidth: '0' 
    }}>
      <img 
        src={cottage.media_urls?.[0] || 'default.jpg'} 
        style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '15px', marginBottom: '15px' }}
        alt={cottage.name}
      />
      <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>{cottage.name}</h3>
      <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '16px' }}>{cottage.rooms || '1'}-комнатный дом</p>
      <p style={{ margin: '0 0 15px 0', color: '#999', fontSize: '14px' }}>{cottage.region}, {cottage.city}</p>
      
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#598850', marginBottom: '15px' }}>
        {cottage.price_per_night} BYN
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
        <Link to={`/cottage/${cottage.id}`} style={{
          padding: '12px', border: '1px solid #598850', color: '#598850', 
          borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '15px'
        }}>Подробнее</Link>
        
        <button onClick={() => handleDelete(cottage.id)} style={{
          padding: '12px', border: '1px solid #d9534f', color: '#d9534f',
          borderRadius: '10px', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px'
        }}>Удалить объект</button>
      </div>
    </div>
  ))}
</div>
    </div>

    </div>
  );
}