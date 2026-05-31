import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ru } from 'date-fns/locale'; 

registerLocale('ru', ru);

export default function CottageDetails() {
  const { id } = useParams();
  const [cottage, setCottage] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Состояния для дат
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Добавляем функцию обработки бронирования
  const handleBooking = () => {
    if (!startDate || !endDate) {
      alert("⚠️ Пожалуйста, выберите диапазон дат!");
      return;
    }
    
    // Пример вывода дат для проверки
    console.log(`Бронируем с ${startDate} по ${endDate}`);
    alert("Бронирование принято!");
  };

  useEffect(() => {
    const fetchCottage = async () => {
      try {
        const response = await API.get(`/cottages/${id}`);
        setCottage(response.data);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCottage();
  }, [id]);

  if (loading) return <div>Загрузка...</div>;
  if (!cottage) return <div>Коттедж не найден</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>{cottage.name}</h1>
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* ЛЕВАЯ ЧАСТЬ */}
        <div style={{ flex: '1 1 500px' }}>
          <img src={cottage.image_url} alt={cottage.name} style={{ width: '100%', borderRadius: '10px' }} />
          <p style={{ fontSize: '18px', margin: '20px 0' }}>{cottage.description}</p>
          
          <h3>Удобства:</h3>
          <ul>
            {cottage.amenities?.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>

        {/* ПРАВАЯ ЧАСТЬ */}
        <div style={{ flex: '1 1 300px', background: '#f4f4f4', padding: '20px', borderRadius: '10px', height: 'fit-content' }}>
          <h3>Бронирование</h3>
          <p>Цена: <strong>{cottage.price}₽ / ночь</strong></p>
          
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
          />

          <button 
            style={{ width: '100%', background: '#2ecc71', color: '#fff', padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px', fontSize: '16px' }}
            onClick={handleBooking}
          >
            Забронировать
          </button>
        </div>
      </div>
    </div>
  );
}