import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Определяем функцию ВНУТРИ эффекта, чтобы избежать каскадных рендеров
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/bookings/my');
      setBookings(data);
    } catch (err) {
      console.error("Ошибка:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []); // Пустой массив зависимостей

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Вы уверены, что хотите отменить бронирование?")) return;

    try {
      await API.delete(`/bookings/${bookingId}`);
      alert("✅ Бронирование отменено");
      
      // Локальное обновление статуса
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
    } catch (err) {
      alert("❌ Не удалось отменить: " + (err.response?.data?.message || "Ошибка"));
    }
  };
  
  const getStatusInfo = (status) => {
    switch(status) {
      case 'confirmed': return { label: 'Подтверждено', color: '#059669', bg: '#d1fae5' };
      case 'pending': return { label: 'На рассмотрении', color: '#d97706', bg: '#fef3c7' };
      case 'cancelled': return { label: 'Отменено', color: '#dc2626', bg: '#fee2e2' };
      default: return { label: status, color: '#4b5563', bg: '#f3f4f6' };
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', fontSize: '18px', color: '#666' }}>Загрузка...</div>;

  return (
    <div style={{ padding: '40px 5%', width: '100%', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', margin: '0 0 10px 0', color: '#111', fontWeight: '800' }}>Мои бронирования</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>Управляйте историей ваших поездок.</p>
      </header>
      
      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: '#f9fafb', borderRadius: '32px', border: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏠</div>
          <h2 style={{ color: '#333' }}>Пока пусто</h2>
          <p style={{ color: '#888' }}>Вы еще не совершили ни одного бронирования.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          // Адаптивная сетка: на мобильных от 320px, на десктопах заполняет доступное место
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '24px' 
        }}>
          {bookings.map(b => {
            
            const statusInfo = getStatusInfo(b.status);
            const imageUrl = b.media_urls?.[0]; 

            return (
              <div key={b.id} style={{ 
                background: '#fff',
                padding: '24px', 
                borderRadius: '24px', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column', // Удобнее на мобильных
                gap: '16px',
                border: '1px solid #f3f4f6'
              }}>
                <div style={{ width: '100%', height: '180px', borderRadius: '20px', overflow: 'hidden', background: '#eee' }}>
                  <img src={imageUrl || 'https://via.placeholder.com/400x200'} alt={b.cottage_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '700', color: '#111' }}>{b.cottage_name}</h3>
                  <div style={{ color: '#666', fontSize: '15px' }}>
                    📅 {new Date(b.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} — {new Date(b.end_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div style={{ 
                    backgroundColor: statusInfo.bg, color: statusInfo.color,
                    padding: '8px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '700'
                  }}>
                    {statusInfo.label}
                  </div>
                  
                  <div style={{ fontWeight: '800', fontSize: '19px', color: '#111' }}>
                    {b.total_price ? parseFloat(b.total_price).toLocaleString() : '0'} BYN
                  </div>

                  {b.status === 'pending' && (
                    <button 
                      onClick={() => handleCancel(b.id)}
                      style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}