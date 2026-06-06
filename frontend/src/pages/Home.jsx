import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';
import Notification from '../components/Notification';
import { AuthContext } from '../context/AuthContext'; // Убедитесь, что путь к файлу верный

export default function Home() {
  const navigate = useNavigate(); 
  const [cottages, setCottages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Состояния для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Получаем данные текущего пользователя, чтобы узнать его роль
  const currentUser = JSON.parse(localStorage.getItem('user')) || null;
  const { user } = useContext(AuthContext); // Теперь useContext будет работать
  const isAdmin = user?.role === 'admin'; // Это та самая логика прав

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [errorMsg, setErrorMsg] = useState(null); // Состояние для ошибки

  // Выносим запрос в отдельную функцию, чтобы её можно было вызывать и при загрузке, и после удаления
  const fetchCottages = async (page) => {
    setLoading(true);
    try {
      // Отправляем запрос с указанием нужной страницы (лимит 3)
      const response = await API.get(`/cottages?page=${page}&limit=3`);
      
      // Поддерживаем как новый формат (с пагинацией), так и старый (если бэкенд еще не обновлен)
      const data = response.data.data || response.data;
      setCottages(data);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Ошибка при загрузке домиков:", err);
      const serverDetail = err.response?.data?.error || err.response?.data?.message || err.message;
      setErrorMsg("Ошибка БД на бэкенде: ${serverDetail}");
      setError(`Не удалось загрузить каталог домиков. Причина: ${serverDetail}`);
    } finally {
      setLoading(false);
    }
  };

  // Запрашиваем данные при первой загрузке и при смене страницы
  useEffect(() => {
    fetchCottages(currentPage);
  }, [currentPage]);

  // Функции переключения страниц
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

    // Замените старую функцию handleDelete на эту:
  const handleDelete = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  // Создайте отдельную функцию для выполнения самого удаления
  const confirmDeleteAction = async () => {
    const { id } = deleteModal;
    try {
      const token = localStorage.getItem('token');
      
      const response = await API.delete(`/cottages/${deleteModal.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setErrorMsg("Объявление успешно удалено!");
        fetchCottages(currentPage); // Перезагружаем список
      }
    } catch (err) {
      setErrorMsg("Ошибка при удалении");
    } finally {
      setDeleteModal({ isOpen: false, id: null, name: '' }); // Закрываем модалку
    }
  };

  if (loading && cottages.length === 0) return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Загрузка уютных домиков...</div>;
  if (error) return <div style={{ padding: '20px', color: '#e74c3c', textAlign: 'center' }}>⚠️ {error}</div>;

  return (
    <div>
      {errorMsg && (
        <Notification message={errorMsg} onClose={() => setErrorMsg(null)} />
      )}
    <div style={{ padding: '0 20px 20px 20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', width: '100%', 
   // Ограничивает ширину, чтобы контент не растягивался на огромные экраны
   }}>
      
      {/* Кнопка навигации к поиску */}
      <div style={{ marginTop: '23px', marginBottom: '20px', padding: '0 10px' }}>
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
              position: 'relative',
              minWidth: '280px'
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

              {/* Кнопка Удалить (Доступна только админам) */}
              {/* Кнопка Удалить (Доступна только админам) */}
{user && user.role === 'admin' && (
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

      {/* --- БЛОК ПАГИНАЦИИ --- */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '20px', 
          marginTop: '40px',
          paddingBottom: '20px'
        }}>
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1 || loading}
            style={{
              padding: '12px 24px',
              cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer',
              background: (currentPage === 1 || loading) ? '#e0e0e0' : '#7a9cb2',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => { if (currentPage !== 1 && !loading) e.target.style.background = '#65889e' }}
            onMouseOut={(e) => { if (currentPage !== 1 && !loading) e.target.style.background = '#7a9cb2' }}
          >
            ← Назад
          </button>

          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '16px', 
            color: '#555',
            minWidth: '120px',
            textAlign: 'center'
          }}>
            Страница {currentPage} из {totalPages}
          </span>

          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages || loading}
            style={{
              padding: '12px 24px',
              cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer',
              background: (currentPage === totalPages || loading) ? '#e0e0e0' : '#7a9cb2',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => { if (currentPage !== totalPages && !loading) e.target.style.background = '#65889e' }}
            onMouseOut={(e) => { if (currentPage !== totalPages && !loading) e.target.style.background = '#7a9cb2' }}
          >
            Вперед →
          </button>
        </div>
      )}
      <ConfirmModal 
  isOpen={deleteModal.isOpen}
  message={`Вы уверены, что хотите удалить объект "${deleteModal.name}"?`}
  onConfirm={confirmDeleteAction}
  onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
/>
    </div>
    </div>
  );
}