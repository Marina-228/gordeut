import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Home() {
  const navigate = useNavigate(); 
  const [cottages, setCottages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Получаем данные текущего пользователя, чтобы узнать его роль
  // (Замени 'user' на ключ, под которым ты сохраняешь данные юзера при авторизации)
  const currentUser = JSON.parse(localStorage.getItem('user')) || null;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const fetchCottages = async () => {
      try {
        const response = await API.get('/cottages');
        setCottages(response.data);
      } catch (err) {
        console.error("Ошибка при загрузке домиков:", err);
        setError('Не удалось загрузить каталог домиков.');
      } finally {
        setLoading(false);
      }
    };
    fetchCottages();
  }, []);

  // Функция удаления карточки домика
  const handleDelete = async (id, name) => {
  const confirmDelete = window.confirm(`Вы уверены, что хотите удалить объект "${name || 'Без названия'}"?`);
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert("Ошибка: Токен авторизации не найден. Пожалуйста, перезайдите в аккаунт.");
      return;
    }

    // Делаем запрос через axios (API.delete уже включает базовый URL)
    const response = await API.delete(`/cottages/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}` // Передаем токен в явном виде
      }
    });

    // Если сервер вернул success
    if (response.data.success) {
      setCottages(prev => prev.filter(cottage => cottage.id !== id));
      alert('Объявление успешно удалено!');
    } else {
      alert(`Не удалось удалить: ${response.data.message}`);
    }

  } catch (err) {
    console.error("Полная ошибка удаления на фронте:", err);
    
    // Выводим то, что реально ответил сервер, чтобы не гадать
    const serverMessage = err.response?.data?.message || err.response?.data?.error;
    alert(`Ошибка при удалении: ${serverMessage || 'Сервер не отвечает или упал'}`);
  }
};

  

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Загрузка уютных домиков...</div>;
  if (error) return <div style={{ padding: '20px', color: '#e74c3c', textAlign: 'center' }}>⚠️ {error}</div>;

  return (
    <div style={{ padding: '0 20px 20px 20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Кнопка навигации к поиску */}
      <div style={{ marginTop: '23px', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/search')}
          style={{ 
            display: 'block',
            width: '100%',
            background: '#7a9cb2',
            color: '#fff', 
            padding: '14px 0', 
            borderRadius: '12px',
            border: 'none',
            textDecoration: 'none', 
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#65889e'}
          onMouseOut={(e) => e.target.style.background = '#7a9cb2'}
        >
          Куда поедем?
        </button>
      </div>

      {/* Сетка домиков */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        alignItems: 'stretch',
        marginTop: '10px' 
      }}>
        {cottages.map((cottage) => (
          <div 
            key={cottage.id} 
            style={{ 
              border: '1px solid #eee', 
              borderRadius: '24px', 
              boxShadow: '0 6px 12px rgba(0,0,0,0.05)', 
              display: 'flex', 
              flexDirection: 'column',
              background: '#fff',
              padding: '20px', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              position: 'relative' // Для абсолютного позиционирования элементов внутри, если понадобится
            }}
          >
            {/* Контейнер контента */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Блок изображения */}
              <div style={{ 
                width: '100%', 
                aspectRatio: '16 / 9', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '12px', 
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {cottage.media_urls?.[0] ? (
                  <img 
                    src={cottage.media_urls[0]} 
                    alt={cottage.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x225?text=Нет+фото'; }}
                  />
                ) : (
                  <span style={{ color: '#aaa', fontSize: '13px' }}>Нет фото</span>
                )}
              </div>
              
              {/* Название объекта */}
              <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#222', textAlign: 'center', fontWeight: 'bold' }}>
                {cottage.name || 'Название объекта'}
              </h2>

              {/* Информация о комнатах и типе */}
              <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '15px', lineHeight: '1.3' }}>
                <div style={{ fontWeight: '600', color: '#333' }}>
                  {cottage.rooms ? `${cottage.rooms} ${cottage.type === 'house' ? '- комнатный дом' : '- комнатная квартира'}` : 'Объект'}
                </div>
                <div style={{ fontStyle: 'italic', marginTop: '2px', color: '#888' }}>
                  {[cottage.region, cottage.city].filter(Boolean).join(', ') || 'Адрес не указан'}
                </div>
              </div>

              {/* Разделительная линия */}
              <hr style={{ border: 'none', borderTop: '1px solid #eee', width: '80%', margin: '0 auto 15px auto' }} />

              {/* Стоимость */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
                <strong style={{ fontSize: '24px', color: '#598850' }}>
                  {cottage.price_per_night ? `${parseFloat(cottage.price_per_night)} BYN` : '—'}
                </strong>
              </div>
            </div>

            {/* Контейнер для кнопок внизу карточки */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Кнопка Подробнее (Доступна всем) */}
              <Link 
                to={`/cottage/${cottage.id}`} 
                style={{ 
                  display: 'block', 
                  width: '100%',
                  boxSizing: 'border-box',
                  textAlign: 'center', 
                  background: '#f8f9fa',
                  border: '2px solid #598850',
                  color: '#598850', 
                  padding: '12px', 
                  borderRadius: '10px', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  fontSize: '15px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#598850';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.color = '#598850';
                }}
              >
                Подробнее
              </Link>

              {/* Кнопка Удалить (Рендерится только ЕСЛИ пользователь является АДМИНИСТРАТОРОМ) */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(cottage.id, cottage.name)}
                  style={{
                    display: 'block',
                    width: '100%',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    background: '#fff',
                    border: '2px solid #e74c3c',
                    color: '#e74c3c',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#e74c3c';
                    e.target.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#e74c3c';
                  }}
                >
                  Удалить объект
                </button>
              )}

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}