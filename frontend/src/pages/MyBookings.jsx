import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await API.get('/bookings/my');
        setBookings(response.data);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Вы уверены, что хотите отменить бронирование?")) return;
    try {
      await API.patch(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert("Ошибка при отмене: возможно, соединение с сервером разорвано.");
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(650px, 1fr))', 
          gap: '24px' 
        }}>
          {bookings.map(b => {
            const statusInfo = getStatusInfo(b.status);
            // Если у вас есть локальный файл, можно использовать путь /images/cottage.jpg
            const imageUrl = b.media_urls?.[0]; 

            return (
              <div key={b.id} style={{ 
                background: '#fff',
                padding: '24px', 
                borderRadius: '24px', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                border: '1px solid #f3f4f6',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.05)';
              }}>
                
                <div style={{ width: '250px', height: '130px', borderRadius: '20px', overflow: 'hidden', flexShrink: 0, background: '#eee' }}>
                  <img src={imageUrl || 'https://via.placeholder.com/130'} alt={b.cottage_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '700', color: '#111' }}>{b.cottage_name}</h3>
                  <div style={{ color: '#666', fontSize: '15px' }}>
                    📅 {new Date(b.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} — {new Date(b.end_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ 
                    backgroundColor: statusInfo.bg, color: statusInfo.color,
                    padding: '8px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: '700'
                  }}>
                    {statusInfo.label}
                  </div>
                  
                  <div style={{ fontWeight: '800', fontSize: '19px', color: '#111', minWidth: '90px', textAlign: 'right' }}>
                    {parseFloat(b.total_price).toLocaleString()} BYN
                  </div>

                  {b.status === 'pending' && (
                    <button onClick={() => handleCancel(b.id)} style={{
                      background: '#fff', border: '1.5px solid #fee2e2', color: '#dc2626', 
                      fontSize: '14px', cursor: 'pointer', borderRadius: '12px', padding: '10px 20px',
                      fontWeight: '600', transition: 'all 0.2s', outline: 'none'
                    }}
                    onMouseOver={(e) => { e.target.style.background = '#fee2e2'; }}
                    onMouseOut={(e) => { e.target.style.background = '#fff'; }}>
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