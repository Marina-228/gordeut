import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ru } from 'date-fns/locale'; 

registerLocale('ru', ru);

export default function CottageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cottage, setCottage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Вспомогательные функции для ручного ввода
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
    // 1. Проверка авторизации
    const token = localStorage.getItem('token');
    if (!token) {
        alert("⚠️ Пожалуйста, войдите в систему для бронирования!");
        navigate('/login');
        return;
    }

    // 2. Более строгая проверка дат
    if (!startDate || !endDate) {
      alert("⚠️ Пожалуйста, выберите корректный диапазон дат!");
      return;
    }

    // 3. Безопасное форматирование с проверкой типа
    const formatDate = (date) => {
      if (!(date instanceof Date) || isNaN(date)) return null;
      return date.toISOString().split('T')[0];
    };

    const check_in_date = formatDate(startDate);
    const check_out_date = formatDate(endDate);

    if (!check_in_date || !check_out_date) {
        alert("⚠️ Ошибка формата дат!");
        return;
    }

    const bookingData = {
      cottage_id: parseInt(id),
      check_in_date,    // убедитесь, что на бэкенде в req.body именно эти ключи
      check_out_date
    };

    console.log("Отправка данных на сервер:", bookingData); // ДЛЯ ОТЛАДКИ

    try {
      await API.post('/bookings', bookingData);
      alert("✅ Бронирование успешно создано!");
      navigate('/my-bookings');
    } catch (err) {
      console.error("Полная ошибка от сервера:", err.response);
      const errorMessage = err.response?.data?.message || "Не удалось отправить данные";
      alert("❌ Ошибка: " + errorMessage);
    }
  };

  useEffect(() => {
    const fetchCottage = async () => {
      try {
        const response = await API.get(`/cottages/${id}`);
        setCottage(response.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCottage();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Загрузка...</div>;
  if (!cottage) return <div style={{ padding: '40px', textAlign: 'center' }}>Коттедж не найден</div>;

  return (
    <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
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
    onChange={(dates) => { const [start, end] = dates; setStartDate(start); setEndDate(end); }}
    startDate={startDate}
    endDate={endDate}
    selectsRange
    inline
    locale="ru"
    minDate={new Date()}
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