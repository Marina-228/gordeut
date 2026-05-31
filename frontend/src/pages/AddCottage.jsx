import React, { useState, useEffect, useContext } from 'react'; // Добавьте useContext
import { CottageContext } from '../context/CottageContext'; // Укажите путь к вашему контексту
import Cropper from 'react-easy-crop';

const styles = {
  pageWrapper: { 
    display: 'flex', justifyContent: 'center', alignItems: 'flex-start', 
    minHeight: '100vh', padding: '60px 20px', background: '#f9f9f9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '1000px', width: '100%' },
  card: { 
    background: '#fff', padding: '30px', borderRadius: '20px', 
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', height: 'fit-content' 
  },
  contentWrapper: { paddingTop: '20px', display: 'flex', flexDirection: 'column' },
  input: (hasError) => ({ 
    width: '100%', padding: '14px', borderRadius: '12px', boxSizing: 'border-box',
    border: hasError ? '2px solid #d9534f' : '1px solid #e0e0e0', 
    marginBottom: '5px' 
  }),
  textArea: { 
    width: '100%', padding: '14px', borderRadius: '12px', boxSizing: 'border-box',
    border: '1px solid #e0e0e0', marginBottom: '5px', minHeight: '100px', resize: 'vertical'
  },
  errorText: { color: '#d9534f', fontSize: '12px', marginBottom: '10px', fontWeight: '600' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' },
  button: { 
    padding: '14px 25px', background: 'rgb(89, 136, 90)', color: '#fff', 
    border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px',
    fontWeight: 'bold', width: '100%', marginTop: '10px' 
  }
};

const buttonStyles = {
  main: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #6b9389 0%, #4a754b 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'transform 0.2s, background 0.3s',
    boxShadow: '0 4px 12px rgba(89, 136, 90, 0.3)'
  },
  secondary: {
    padding: '12px 20px',
    background: '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background 0.3s'
  },
  danger: {
    padding: '8px 16px',
    background: '#ffebee',
    color: '#d32f2f',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    marginTop: '10px'
  }
};

const BELARUS_REGIONS = [
  "Брестская область", "Витебская область", "Гомельская область", 
  "Гродненская область", "Минская область", "Могилевская область"
];

// Вспомогательная функция для обрезки canvas
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
      resolve(canvas.toDataURL('image/jpeg'));
    };
  });
};

// Компонент обрезки (вызывать внутри шага 4)
function ImageCropper({ image, onDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 1000, padding: 20 }}>
      <Cropper image={image} crop={crop} zoom={zoom} aspect={16/9} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, p) => setArea(p)} />
      <button style={{ position: 'absolute', bottom: 20, right: 20 }} onClick={async () => onDone(await getCroppedImg(image, area))}>Сохранить</button>
    </div>
  );
};

export default function AddCottageWizard() {
  const { setCottages } = useContext(CottageContext);
  const [croppedImg, setCroppedImg] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', rooms: '', type: 'house', min_guests: '', max_guests: '',
    region: '', city: '', address: '', description: '', price: '' 
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const newErrors = {};
    const min = Number(formData.min_guests);
    const max = Number(formData.max_guests);
    const price = Number(formData.price);

    if (formData.rooms !== '' && Number(formData.rooms) <= 0) newErrors.rooms = "Где положительное число? 😡";
    if (formData.min_guests !== '' && min <= 0) newErrors.min_guests = "Где положительное число? 😡";
    if (formData.max_guests !== '' && max <= 0) newErrors.max_guests = "Где положительное число? 😡";
    if (formData.min_guests !== '' && formData.max_guests !== '' && min > max) {
      newErrors.min_guests = "Мин. больше макс 😡";
      newErrors.max_guests = "Макс. меньше мин 😡";
    }
    if (formData.price !== '' && price < 0) newErrors.price = "Цена не может быть отрицательной..";
    setErrors(newErrors);
  }, [formData]);

  const handleNext = () => {
    if (step === 1) {
      if (Object.keys(errors).length === 0 && formData.rooms && formData.min_guests && formData.max_guests) setStep(2);
      else alert("Исправьте ошибки на первом шаге!");
    } else if (step === 2) {
      if (formData.region && formData.city && formData.address) setStep(3);
      else alert("Заполните адресные данные!");
    } else if (step === 3) {
      if (formData.price !== '' && !errors.price) setStep(4);
      else alert("Введите корректную цену!");
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
  if (!formData.name || !formData.price || !croppedImg) {
    alert("Пожалуйста, заполните основные поля и добавьте фото!");
    return;
  }

  const cottageData = { ...formData, image: croppedImg };

  try {
    // ДОСТАЕМ ТОКЕН (измени ключ 'token', если у тебя он называется иначе)
    const token = localStorage.getItem('token'); 

    const response = await fetch('http://localhost:5000/api/cottages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // ОБЯЗАТЕЛЬНО передаем токен в заголовках
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(cottageData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      setCottages(prev => [...prev, result.data]);
      alert("Объявление успешно сохранено! 🎉");
    } else {
      // Исправляем вывод ошибки, если сервер вернул message вместо error
      alert(`Ошибка сервера: ${result.message || result.error || 'Неизвестная ошибка'}`);
    }
  } catch (error) {
    console.error("Ошибка запроса:", error);
    alert("Не удалось связаться с сервером.");
  }
};

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>{step === 1 ? 'Основная информация' : step === 2 ? 'Расположение' : step === 3 ? 'Описание и цена' : 'Фото'}</h2>
          
          <div style={styles.contentWrapper}>
           {step === 1 && (
  <>
    <label style={styles.label}>Название</label>
    <input 
      style={styles.input(false)} 
      value={formData.name} 
      onChange={e => setFormData({...formData, name: e.target.value})} 
    />
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
       <div>
         <label style={styles.label}>Комнат</label>
         <input 
           style={styles.input(!!errors.rooms)} 
           type="number" 
           value={formData.rooms} 
           onChange={e => setFormData({...formData, rooms: e.target.value})} 
         />
         {errors.rooms && <div style={styles.errorText}>{errors.rooms}</div>}
       </div>
       <div>
         <label style={styles.label}>Тип</label>
         <select 
           style={styles.input(false)} 
           value={formData.type} 
           onChange={e => setFormData({...formData, type: e.target.value})}
         >
           <option value="house">Дом</option>
           <option value="apartment">Квартира</option>
         </select>
       </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
       <div>
         <label style={styles.label}>Мин. гостей</label>
         <input 
           style={styles.input(!!errors.min_guests)} 
           type="number" 
           value={formData.min_guests} 
           onChange={e => setFormData({...formData, min_guests: e.target.value})} 
         />
       </div>
       <div>
         <label style={styles.label}>Макс. гостей</label>
         <input 
           style={styles.input(!!errors.max_guests)} 
           type="number" 
           value={formData.max_guests} 
           onChange={e => setFormData({...formData, max_guests: e.target.value})} 
         />
       </div>
    </div>
    {errors.min_guests && <div style={styles.errorText}>{errors.min_guests}</div>}
    {errors.max_guests && <div style={styles.errorText}>{errors.max_guests}</div>}
    
    <button style={styles.button} onClick={handleNext}>Далее</button>
  </>
)}

           {/* Шаг 2 */}
{step === 2 && (
  <>
    <label style={styles.label}>Область</label>
    <select 
      style={styles.input(false)} 
      value={formData.region} // Привязка к состоянию
      onChange={e => setFormData({...formData, region: e.target.value})}
    >
      <option value="">Выберите область</option>
      {BELARUS_REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
    </select>

    <label style={styles.label}>Город</label>
    <input 
      style={styles.input(false)} 
      value={formData.city} // Привязка к состоянию
      onChange={e => setFormData({...formData, city: e.target.value})} 
    />

    <label style={styles.label}>Адрес</label>
    <input 
      style={styles.input(false)} 
      value={formData.address} // Привязка к состоянию
      onChange={e => setFormData({...formData, address: e.target.value})} 
    />
    
    <div style={{ display: 'flex', gap: '10px' }}>
      <button 
        style={{...styles.button, background: '#7a9cb2'}} 
        onClick={() => setStep(1)}
      >
        Назад
      </button>
      <button style={styles.button} onClick={handleNext}>Далее</button>
    </div>
  </>
)}

            {/* Шаг 3 */}
{step === 3 && (
  <>
    <label style={styles.label}>Описание</label>
    <textarea 
      style={styles.textArea} 
      value={formData.description} // Привязка к состоянию
      onChange={e => setFormData({...formData, description: e.target.value})} 
    />

    <label style={styles.label}>Цена за ночь</label>
    <input 
      style={styles.input(!!errors.price)} 
      type="number" 
      value={formData.price} // Привязка к состоянию
      onChange={e => setFormData({...formData, price: e.target.value})} 
    />
    {errors.price && <div style={styles.errorText}>{errors.price}</div>}
    
    <div style={{ display: 'flex', gap: '10px' }}>
      <button 
        style={{...styles.button, background: '#7a9cb2'}} 
        onClick={() => setStep(2)}
      >
        Назад
      </button>
      <button style={styles.button} onClick={handleNext}>Далее</button>
    </div>
  </>
)}

{/* ЛЕВАЯ ЧАСТЬ (внутри формы) */}
{step === 4 && (
  <div style={{ textAlign: 'center', paddingTop: '10px' }}>
    <label style={{ display: 'block', marginBottom: '20px', color: '#666' }}>
      {croppedImg ? "Фото успешно добавлено" : "Выберите главное фото для объявления"}
    </label>

    {!croppedImg && !rawFile && (
      <label style={{ 
        ...styles.button, 
        display: 'block', // Меняем на block, чтобы растянуть на 100%
        width: '100%',    // Растягиваем на всю ширину
        boxSizing: 'border-box', // Чтобы padding не вылезал за границы
        cursor: 'pointer', 
        background: '#f0f0f0', 
        color: '#333',
        border: '2px dashed #ccc',
        padding: '16px',
        marginTop: '0'
      }}>
        Выбрать файл
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => e.target.files[0] && setRawFile(URL.createObjectURL(e.target.files[0]))} 
          style={{ display: 'none' }} 
        />
      </label>
    )}

    {rawFile && !croppedImg && (
      <ImageCropper image={rawFile} onDone={(url) => { setCroppedImg(url); setRawFile(null); }} />
    )}

    {croppedImg && (
      <div style={{ position: 'relative', marginTop: 10 }}>
        <img src={croppedImg} style={{ width: '100%', borderRadius: 15, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
        <button 
          style={{ 
            ...styles.button, 
            width: '100%', // Растягиваем кнопку изменения
            background: '#fff', 
            color: '#d9534f', 
            border: '1px solid #d9534f',
            marginTop: '15px',
            padding: '12px'
          }} 
          onClick={() => { setCroppedImg(null); setRawFile(null); }}
        >
          Изменить фото
        </button>
      </div>
    )}

    <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
      {/* Теперь кнопки навигации тоже занимают по 50% ширины каждая */}
      <button style={{...styles.button, background: '#7a9cb2', width: '100%'}} onClick={() => setStep(3)}>Назад</button>
      <button 
  style={{...styles.button, width: '100%'}} 
  onClick={handleSubmit} // Вместо alert("Объявление сохранено!")
>
  Сохранить 
</button>
    </div>
  </div>
)}
            </div>
    </div>

<div style={{ ...styles.card, position: 'sticky', top: '40px', border: '1px solid #eee', padding: '20px', alignItems: 'center' }}>
  <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333', textAlign: 'center' }}>Предпросмотр</h3>
  
  {/* Блок изображения: фиксированная высота 180px */}
  <div style={{ 
    width: '100%', 
    /* Убираем жесткий height, чтобы картинка сама подстраивалась под пропорции 16/9, 
       как в большинстве кропперов */
    aspectRatio: '16 / 9', 
    backgroundColor: '#f0f0f0', 
    borderRadius: '12px', 
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  }}>
    {croppedImg ? (
      <img 
        src={croppedImg} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' // Это сохранит пропорции картинки
        }} 
      />
    ) : (
      <span style={{ color: '#aaa', fontSize: '13px' }}>Нет фото</span>
    )}
  </div>

  {/* Остальной контент */}
  <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#222', textAlign: 'center' }}>
    {formData.name || 'Название объекта'}
  </h2>

  <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '15px', lineHeight: '1.3' }}>
    <div style={{ fontWeight: '600', color: '#333' }}>
      {formData.rooms ? `${formData.rooms}-ая ${formData.type === 'house' ? 'дом' : 'квартира'}` : 'Объект'}
    </div>
    <div style={{ fontStyle: 'italic', marginTop: '2px' }}>
      {[formData.region, formData.city].filter(Boolean).join(', ') || 'Адрес не указан'}
    </div>
  </div>

  <hr style={{ border: 'none', borderTop: '1px solid #eee', width: '80%', margin: '0 auto 15px auto' }} />

  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
    <strong style={{ fontSize: '24px', color: '#598850' }}>
      {formData.price ? `${formData.price} BYN` : '—'}
    </strong>
  </div>
</div>
      </div>
    </div>
  );
}