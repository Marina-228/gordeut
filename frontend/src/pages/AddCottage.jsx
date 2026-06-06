import React, { useState, useEffect, useContext } from 'react'; 
import { CottageContext } from '../context/CottageContext'; 
import Cropper from 'react-easy-crop';
import Notification from '../components/Notification';

const styles = {
  pageWrapper: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    minHeight: '100vh', 
    // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: заставляем блок занимать всю ширину, чтобы он не сжимался
    width: '100%', 
    flexGrow: 1, 
    padding: '40px 20px', 
    background: '#f9f9f9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box'
  },
  container: { 
    display: 'grid', 
    gap: '30px', 
    // Жестко фиксируем сетку
    width: '100%',
    maxWidth: '1050px', 
    alignItems: 'stretch', 
    margin: '0 auto' 
  },
  card: { 
    background: '#fff', 
    padding: '40px',
    borderRadius: '20px', 
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)', 
    display: 'flex', 
    flexDirection: 'column',
    width: '100%', 
    minHeight: '560px', 
    boxSizing: 'border-box'
  },
  previewCard: { 
    background: '#fff', 
    padding: '40px', 
    borderRadius: '20px', 
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)', 
    border: '1px solid #eee', 
    display: 'flex', 
    flexDirection: 'column',
    width: '100%', 
    boxSizing: 'border-box'
  },
  input: (hasError) => ({ 
    width: '100%', padding: '14px', borderRadius: '12px', boxSizing: 'border-box',
    border: hasError ? '2px solid #d9534f' : '1px solid #e0e0e0', 
    marginBottom: '15px' 
  }),
  textArea: { 
    width: '100%', padding: '14px', borderRadius: '12px', boxSizing: 'border-box',
    border: '1px solid #e0e0e0', marginBottom: '15px', minHeight: '120px', resize: 'vertical'
  },
  errorText: { color: '#d9534f', fontSize: '12px', marginBottom: '10px', marginTop: '-10px', fontWeight: '600' },
  label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' },
  button: { 
    padding: '14px 25px', background: 'rgb(89, 136, 90)', color: '#fff', 
    border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px',
    fontWeight: 'bold', width: '100%'
  }
};

const BELARUS_REGIONS = [
  "Брестская область", "Витебская область", "Гомельская область", 
  "Гродненская область", "Минская область", "Могилевская область"
];

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

function ImageCropper({ image, onDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 1000, padding: 20 }}>
      <Cropper image={image} crop={crop} zoom={zoom} aspect={16/9} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, p) => setArea(p)} />
      <button style={{ position: 'absolute', bottom: 20, right: 20, ...styles.button, width: 'auto' }} onClick={async () => onDone(await getCroppedImg(image, area))}>Сохранить обрезку</button>
    </div>
  );
}

export default function AddCottageWizard() {
  const [errorMsg, setErrorMsg] = useState(null); 
  const [isSuccess, setIsSuccess] = useState(false); 
  const { setCottages } = useContext(CottageContext);
  const [croppedImg, setCroppedImg] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', rooms: '', type: 'house', min_guests: '', max_guests: '',
    region: '', city: '', address: '', description: '', price: '' 
  });
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const newErrors = {};
    const min = Number(formData.min_guests);
    const max = Number(formData.max_guests);
    const price = Number(formData.price);

    if (formData.rooms !== '' && Number(formData.rooms) <= 0) newErrors.rooms = "Нужно положительное число";
    if (formData.min_guests !== '' && min <= 0) newErrors.min_guests = "Нужно положительное число";
    if (formData.max_guests !== '' && max <= 0) newErrors.max_guests = "Нужно положительное число";
    if (formData.min_guests !== '' && formData.max_guests !== '' && min > max) {
      newErrors.min_guests = "Мин. больше макс.";
      newErrors.max_guests = "Макс. меньше мин.";
    }
    if (formData.price !== '' && price < 0) newErrors.price = "Цена не может быть отрицательной";
    setErrors(newErrors);
  }, [formData]);

  const handleNext = () => {
    if (step === 1) {
      if (Object.keys(errors).length === 0 && formData.name && formData.rooms && formData.min_guests && formData.max_guests) setStep(2);
      else {
        setErrorMsg("Заполните все поля без ошибок!");
        setIsSuccess(false);
      }
    } else if (step === 2) {
      if (formData.region && formData.city && formData.address) setStep(3);
      else {
        setErrorMsg("Заполните адресные данные!");
        setIsSuccess(false);
      }
    } else if (step === 3) {
      if (formData.price !== '' && !errors.price) setStep(4);
      else {
        setErrorMsg("Введите корректную цену!");
        setIsSuccess(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !croppedImg) {
      setErrorMsg("Пожалуйста, заполните основные поля и добавьте фото!");
      setIsSuccess(false);
      return;
    }

    const cottageData = { ...formData, image: croppedImg };

    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch('http://localhost:5000/api/cottages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cottageData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCottages(prev => [...prev, result.data]);
        setIsSuccess(true); 
        setErrorMsg("Объявление успешно сохранено!");
      } else {
        setIsSuccess(false); 
        setErrorMsg(`Ошибка: ${result.message || result.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
      setErrorMsg("Не удалось связаться с сервером.");
      setIsSuccess(false);
    }
  };

  return (
    <div>
      {errorMsg && (
        <Notification message={errorMsg} isSuccess={isSuccess} onClose={() => setErrorMsg(null)} />
      )}
      
      <div style={styles.pageWrapper}>
        {/* ИСПРАВЛЕНИЕ: Сетка теперь динамически меняет колонки, но общая ширина зафиксирована */}
        <div style={{ ...styles.container, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
          
          {/* === ЛЕВАЯ КАРТОЧКА (ФОРМА) === */}
          <div style={styles.card}>
            <h2 style={{ marginTop: 0, marginBottom: '25px', color: '#222' }}>
              {step === 1 ? 'Основная информация' : step === 2 ? 'Расположение' : step === 3 ? 'Описание и цена' : 'Фото'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              
              {/* --- ШАГ 1 --- */}
              {step === 1 && (
                <>
                  <label style={styles.label}>Название</label>
                  <input style={styles.input(false)} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Уютный домик в лесу" />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={styles.label}>Комнат</label>
                      <input style={styles.input(!!errors.rooms)} type="number" value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} />
                      {errors.rooms && <div style={styles.errorText}>{errors.rooms}</div>}
                    </div>
                    <div>
                      <label style={styles.label}>Тип</label>
                      <select style={styles.input(false)} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="house">Дом</option>
                        <option value="apartment">Квартира</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={styles.label}>Мин. гостей</label>
                      <input style={styles.input(!!errors.min_guests)} type="number" value={formData.min_guests} onChange={e => setFormData({...formData, min_guests: e.target.value})} />
                      {errors.min_guests && <div style={styles.errorText}>{errors.min_guests}</div>}
                    </div>
                    <div>
                      <label style={styles.label}>Макс. гостей</label>
                      <input style={styles.input(!!errors.max_guests)} type="number" value={formData.max_guests} onChange={e => setFormData({...formData, max_guests: e.target.value})} />
                      {errors.max_guests && <div style={styles.errorText}>{errors.max_guests}</div>}
                    </div>
                  </div>

                  <div style={{ flexGrow: 1 }} /> 
                  <button style={{...styles.button, margin: 0}} onClick={handleNext}>Далее</button>
                </>
              )}

              {/* --- ШАГ 2 --- */}
              {step === 2 && (
                <>
                  <label style={styles.label}>Область</label>
                  <select style={styles.input(false)} value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                    <option value="">Выберите область</option>
                    {BELARUS_REGIONS.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                  </select>

                  <label style={styles.label}>Город</label>
                  <input style={styles.input(false)} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />

                  <label style={styles.label}>Адрес</label>
                  <input style={styles.input(false)} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  
                  <div style={{ flexGrow: 1 }} /> 
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button style={{...styles.button, background: '#7a9cb2', flex: 1, margin: 0}} onClick={() => setStep(1)}>Назад</button>
                    <button style={{...styles.button, flex: 1, margin: 0}} onClick={handleNext}>Далее</button>
                  </div>
                </>
              )}

              {/* --- ШАГ 3 --- */}
              {step === 3 && (
                <>
                  <label style={styles.label}>Описание</label>
                  <textarea style={styles.textArea} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Опишите все преимущества вашего объекта..." />
                  
                  <label style={styles.label}>Цена за ночь (BYN)</label>
                  <input style={styles.input(!!errors.price)} type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  {errors.price && <div style={styles.errorText}>{errors.price}</div>}
                  
                  <div style={{ flexGrow: 1 }} /> 
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button style={{...styles.button, background: '#7a9cb2', flex: 1, margin: 0}} onClick={() => setStep(2)}>Назад</button>
                    <button style={{...styles.button, flex: 1, margin: 0}} onClick={handleNext}>Далее</button>
                  </div>
                </>
              )}

              {/* --- ШАГ 4 --- */}
              {step === 4 && (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', marginBottom: '15px', color: '#666' }}>
                      {croppedImg ? "Фото успешно добавлено" : "Выберите главное фото для объявления"}
                    </label>

                    {!croppedImg && !rawFile && (
                      <label style={{ 
                        ...styles.button, 
                        display: 'block', 
                        background: '#f0f0f0', color: '#333',
                        border: '2px dashed #ccc', padding: '20px',
                        cursor: 'pointer', margin: 0
                      }}>
                        Выбрать файл
                        <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && setRawFile(URL.createObjectURL(e.target.files[0]))} style={{ display: 'none' }} />
                      </label>
                    )}

                    {rawFile && !croppedImg && (
                      <ImageCropper image={rawFile} onDone={(url) => { setCroppedImg(url); setRawFile(null); }} />
                    )}

                    {croppedImg && (
                      <div style={{ position: 'relative' }}>
                        <img src={croppedImg} alt="Preview" style={{ width: '100%', borderRadius: 15, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                        <button 
                          style={{ ...styles.button, background: '#fff', color: '#d9534f', border: '1px solid #d9534f', marginTop: '15px' }} 
                          onClick={() => { setCroppedImg(null); setRawFile(null); }}
                        >
                          Заменить фото
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ flexGrow: 1 }} /> 
                  <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                    <button style={{...styles.button, background: '#7a9cb2', flex: 1, margin: 0}} onClick={() => setStep(3)}>Назад</button>
                    <button style={{...styles.button, flex: 1, margin: 0}} onClick={handleSubmit}>Сохранить</button>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* === ПРАВАЯ КАРТОЧКА (ПРЕДПРОСМОТР) === */}
          {!isMobile && (
            <div style={styles.previewCard}>
              <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#333', textAlign: 'center' }}>Предпросмотр</h3>
              
              <div style={{ 
                width: '100%', aspectRatio: '16 / 9', backgroundColor: '#f0f0f0', 
                borderRadius: '12px', marginBottom: '20px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}>
                {croppedImg ? (
                  <img src={croppedImg} alt="Cottage" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#aaa', fontSize: '14px' }}>Нет фото</span>
                )}
              </div>

              <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', color: '#222', textAlign: 'center' }}>
                {formData.name || 'Название объекта'}
              </h2>

              <div style={{ textAlign: 'center', color: '#666', fontSize: '15px', marginBottom: '20px', lineHeight: '1.4' }}>
                <div style={{ fontWeight: '600', color: '#333' }}>
                  {formData.rooms ? `${formData.rooms}-ая ${formData.type === 'house' ? 'дом' : 'квартира'}` : 'Объект'}
                </div>
                <div style={{ fontStyle: 'italic', marginTop: '4px', color: '#888' }}>
                  {[formData.region, formData.city].filter(Boolean).join(', ') || 'Адрес не указан'}
                </div>
              </div>

              <div style={{ flexGrow: 1 }} /> 
              
              <hr style={{ border: 'none', borderTop: '1px solid #eee', width: '100%', margin: '0 0 20px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '28px', color: '#598850' }}>
                  {formData.price ? `${formData.price} BYN` : '—'}
                </strong>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}