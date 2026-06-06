import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ru } from 'date-fns/locale'; 
import Notification from '../components/Notification'; // Убедитесь, что путь верный

registerLocale('ru', ru);

export default function CottageDetails() {
  // --- НОВЫЕ СОСТОЯНИЯ ---
  const [notification, setNotification] = useState({ message: null, isSuccess: false });

  const calendarStyles = (
    <style>{`
      .custom-calendar .react-datepicker__day--disabled {
        background-color: #f0f0f0 !important;
        color: #ccc !important;
        cursor: not-allowed !important;
        text-decoration: line-through;
      }
    `}</style>
  );

  const { id } = useParams();
  const navigate = useNavigate();
  const [cottage, setCottage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);

  const formatDateForInput = (date) => (date ? date.toISOString().split('T')[0] : '');
  
  const handleManualDateChange = (val, type) => {
    const date = val ? new Date(val) : null;
    if (type === 'start') setStartDate(date);
    if (type === 'end') setEndDate(date);
  };

  const getDiffDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate - startDate);
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const calculateTotalPrice = () => {
    const price = parseFloat(cottage?.price_per_night || 0);
    if (!startDate || !endDate || !price) return 0;
    const diffDays = getDiffDays();
    let total = diffDays * price;
    if (diffDays > 10) total *= 0.9;
    return total.toFixed(0);
  };

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotification({ message: "Пожалуйста, войдите в систему!", isSuccess: false });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!startDate || !endDate) {
      setNotification({ message: "Выберите диапазон дат!", isSuccess: false });
      return;
    }

    if (startDate && endDate) {
      const isOverlapping = bookedDates.some(busyDate => {
        const bDate = new Date(busyDate).setHours(0,0,0,0);
        const start = new Date(startDate).setHours(0,0,0,0);
        const end = new Date(endDate).setHours(0,0,0,0);
        return bDate >= start && bDate <= end;
      });

      if (isOverlapping) {
        setNotification({ message: "Даты заняты!", isSuccess: false });
        return;
      }
    }

    const formatDate = (date) => (date instanceof Date && !isNaN(date)) ? date.toISOString().split('T')[0] : null;
    const check_in_date = formatDate(startDate);
    const check_out_date = formatDate(endDate);

    try {
      await API.post('/bookings', { cottage_id: parseInt(id), check_in_date, check_out_date });
      setNotification({ message: "Бронирование успешно!", isSuccess: true });
      setTimeout(() => navigate('/my-bookings'), 1500);
    } catch (err) {
      setNotification({ message: err.response?.data?.message || "Ошибка бронирования", isSuccess: false });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cottageRes = await API.get(`/cottages/${id}`);
        setCottage(cottageRes.data);
        const datesRes = await API.get(`/bookings/cottages/${id}/booked-dates`);
        const busy = [];
        datesRes.data.forEach(b => {
          let start = new Date(b.start_date.split('T')[0]);
          let end = new Date(b.end_date.split('T')[0]);
          let current = new Date(start);
          while (current <= end) {
            busy.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        });
        setBookedDates(busy);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* ОТОБРАЖЕНИЕ УВЕДОМЛЕНИЯ */}
      {notification.message && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          <Notification 
            message={notification.message} 
            isSuccess={notification.isSuccess} 
            onClose={() => setNotification({ ...notification, message: null })} 
          />
        </div>
      )}

      {calendarStyles}
      <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* ЛЕВЫЙ БЛОК */}
        <div style={{ flex: '1 1 650px' }}>
          <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', color: '#333' }}>{cottage.name}</h1>
          <img 
            src={cottage.media_urls?.[0] || 'https://via.placeholder.com/800x500'} 
            alt={cottage.name} 
            style={{ width: '100%', height: '450px', objectFit: 'cover', borderRadius: '24px' }} 
          />
          
          <p style={{ fontSize: '18px', marginTop: '20px' }}>{cottage.description}</p>
          
          {/* Блок с гостями - центрированный */}
          <div style={{ 
            marginTop: '30px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%' 
          }}>
            <div style={{ 
              padding: '15px 25px', 
              background: '#f8f9fa', 
              borderRadius: '12px', 
              border: '1px solid #eee', 
              textAlign: 'center' 
            }}>
              <span style={{ fontWeight: 'bold' }}>Вместимость: </span> 
              {cottage.min_guests} – {cottage.max_guests} гостей
            </div>
          </div>
        </div>

        {/* ПРАВЫЙ БЛОК */}
        {/* ПРАВЫЙ БЛОК - ИЗМЕНЕННАЯ СТРУКТУРА */}
<div style={{ flex: '1 1 350px', background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
  <h3 style={{ margin: '0 0 20px 0' }}>Забронировать</h3>

  {/* Контейнер для полей ввода теперь имеет column направление */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
    <div style={{ width: '100%' }}>
      <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Заезд:</label>
      <input type="date" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} value={formatDateForInput(startDate)} onChange={(e) => handleManualDateChange(e.target.value, 'start')} />
    </div>
    <div style={{ width: '100%' }}>
      <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px' }}>Выезд:</label>
      <input type="date" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} value={formatDateForInput(endDate)} onChange={(e) => handleManualDateChange(e.target.value, 'end')} />
    </div>
  </div>

<DatePicker
  selected={startDate}
  onChange={(dates) => { 
    const [start, end] = dates; 
    setStartDate(start); 
    setEndDate(end); 
  }}
  startDate={startDate}
  endDate={endDate}
  selectsRange
  inline
  locale="ru"
  minDate={new Date()}
  // ВАЖНО: вот эта строка отвечает за отображение занятых дат
  excludeDates={bookedDates} 
  calendarClassName="custom-calendar" // ЭТО ВАЖНО: класс должен совпадать с CSS
/>
          {startDate && endDate && (
            <div style={{ marginTop: '25px', padding: '15px', background: '#f7faf7', borderRadius: '12px' }}>
              <p>Итого за {getDiffDays()} суток:</p>
              <strong style={{ fontSize: '20px' }}>{calculateTotalPrice()} BYN</strong>
            </div>
          )}

          <button style={{ width: '100%', background: '#598850', color: '#fff', padding: '15px', border: 'none', borderRadius: '12px', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold' }} onClick={handleBooking}>
            Забронировать
          </button>
        </div>
      </div>
    </div>
  );
}