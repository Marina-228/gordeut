import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';


export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Получаем функцию login из контекста

  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || '');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('savedEmail'));
  const [password, setPassword] = useState('');
  
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  
  const [secretWord, setSecretWord] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [hint, setHint] = useState(''); 

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState(''); 
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Проверяем валидность email для отправки запроса подсказки
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmailForHint = isRecoveryMode && emailRegex.test(email);

  // Живой запрос подсказки ключевого слова
  useEffect(() => {
    if (!isValidEmailForHint) {
      return;
    }

    const fetchHint = async () => {
      
        const response = await API.get(`/auth/secret-word-hint?email=${encodeURIComponent(email)}`);
        if (response.data?.hint) {
          setHint(`💡 Подсказка: «${response.data.hint}»`);
        } else {
          setHint('💡 Подсказка отсутствует, но вы можете попробовать вспомнить слово.');
        }
      
    };

    const delayDebounce = setTimeout(fetchHint, 600);
    
    return () => {
      clearTimeout(delayDebounce);
      setHint(''); 
    };
  }, [email, isValidEmailForHint]);

  const validatePassword = (value) => {
    if (value.length === 0) return '';
    if (value.length < 6) return '😡  Минимум 6 символов';
    if (!/[A-ZА-Я]/.test(value)) return '😡  Нужна одна заглавная буква';
    if (!/[a-zа-я]/.test(value)) return '😡  Нужна одна строчная буква';
    if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(value)) return '😡  Нужен один спецсимвол (!@#$...)';
    return '🥰 Отличный пароль!';
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (val.length > 0 && !emailRegex.test(val)) {
      setEmailError('😡 Некорректный формат email');
    } else {
      setEmailError('');
    }
    if (!emailRegex.test(val)) {
      setHint('');
    }
  };

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    const errMsg = validatePassword(value);
    setPasswordError(errMsg);
  };

  const toggleMode = (mode) => {
    setIsRecoveryMode(mode);
    setError(null);
    setSuccess(false);
    setPasswordError('');
    setSecretWord('');
    setNewPassword('');
    setHint(''); 
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (emailError || !email) {
      setError('Исправьте ошибки в Email перед отправкой');
      return;
    }

    const finalCheck = validatePassword(newPassword);
    if (finalCheck !== '🥰 Отличный пароль!') {
      setError('Новый пароль не соответствует требованиям безопасности.');
      return;
    }

    if (!secretWord || !newPassword) {
      setError('Пожалуйста, заполните все поля формы');
      return;
    }

    try {
      const response = await API.post('/auth/forgot-password', { 
        email, 
        secretWord, 
        newPassword 
      });

      setSuccess(response.data.message);
      setSecretWord('');
      setNewPassword('');
      setPasswordError('');
      setHint('');

      setTimeout(() => {
        toggleMode(false); 
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось изменить пароль.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Базовая проверка email на ошибки перед запросом
    if (emailError) {
      setError('Исправьте ошибки в форме перед отправкой');
      return;
    }

    try {
      // 1. Отправляем запрос на сервер
      const response = await API.post('/auth/login', { email, password });

      // 2. Вызываем функцию login из AuthContext
      // Это действие обновит глобальное состояние, 
      // и Sidebar автоматически покажет кнопку "Профиль"
      login(response.data.user, response.data.token); // было вот так)

      // 4. Логика "Запомнить меня"
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('savedEmail');
      }

      setSuccess('Успешный вход! 👋');
      
      // 5. Перенаправление
      setTimeout(() => { 
        navigate('/profile'); 
      }, 1500);
      
    } catch (err) {
      // 6. Обработка ошибок
      setError(err.response?.data?.message || 'Неверный email или пароль.');
    }
  };

  return (
   <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      width: '100%' 
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: isRecoveryMode ? '640px' : '520px', 
        padding: '45px 50px', 
        background: '#fff', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
        boxSizing: 'border-box',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}>

      <h2 style={{ 
          textAlign: 'center', 
          color: '#1d223b', 
          fontSize: '24px',         
          marginBottom: '25px',      
          fontWeight: '600',
        }}>
          {isRecoveryMode ? 'Восстановление доступа' : 'Вход в систему'}
        </h2>

      {error && <div style={{ color: 'red', textAlign: 'center', fontSize: '14px', fontWeight: '500', marginBottom: '15px' }}> {error}</div>}
      {success && <div style={{ color: 'rgb(123, 171, 125)', textAlign: 'center', fontSize: '14px', fontWeight: '500', marginBottom: '15px' }}> {success}</div>}

      {isRecoveryMode ? (
        /* ДВУХКОЛОНОЧНАЯ ФОРМА ВОССТАНОВЛЕНИЯ ПАРОЛЯ */
        <form onSubmit={handleRecoverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* РЯД 1: Инпуты Email и Ключевого слова */}
          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input 
                type="email" 
                placeholder="Ваш Email" 
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
                style={{ width: '100%', padding: '14px 18px', borderRadius: '8px', border: emailError ? '2px solid red' : '1px solid #ccc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
              {emailError && <span style={{ color: 'red', fontSize: '12px', fontWeight: '500' }}>{emailError}</span>}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input 
                type="text" 
                placeholder="Ваше ключевое слово" 
                value={secretWord}
                onChange={(e) => setSecretWord(e.target.value)}
                required
                style={{ width: '100%', padding: '14px 18px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* ПОДСКАЗКА НА ВСЮ СТРОКУ */}
          {hint && (
            <div style={{ width: '100%', marginTop: '-8px', marginBottom: '-4px' }}>
              <span style={{ 
                fontSize: '13px', 
                color: 'rgb(123, 171, 125)', 
                fontWeight: '500', 
                display: 'block', 
                paddingLeft: '4px', 
                lineHeight: '1.4' 
              }}>
                {hint}
              </span>
            </div>
          )}

          {/* РЯД 2: Новый надежный пароль */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input 
              type="password" 
              placeholder="Новый надежный пароль" 
              value={newPassword}
              onChange={(e) => handleNewPasswordChange(e.target.value)}
              required
              style={{ 
                padding: '14px 18px', 
                borderRadius: '8px', 
                border: passwordError.startsWith('😡') ? '2px solid red' : passwordError.startsWith('🥰') ? '2px solid rgb(123, 171, 125)' : '1px solid #ccc', 
                fontSize: '14px', 
                outline: 'none' 
              }}
            />
            {passwordError && (
              <span style={{ fontSize: '12px', color: passwordError.startsWith('🥰') ? 'rgb(123, 171, 125)' : 'red', fontWeight: '500' }}>
                {passwordError}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', fontSize: '14px' }}>
            <span 
              onClick={() => toggleMode(false)}
              style={{ color: '#7a9cb2', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}
            >
              ← Вернуться ко входу
            </span>
          </div>

          <button type="submit" style={{ background: 'rgb(123, 171, 125)', color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '5px' }}>
            Сбросить и обновить пароль
          </button>
        </form>
      ) : (
        /* ОБЫЧНАЯ ОДНОКОЛОНОЧНАЯ ФОРМА ВХОДА */
        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              style={{ padding: '14px 18px', borderRadius: '8px', border: emailError ? '2px solid red' : '1px solid #ccc', fontSize: '14px', outline: 'none' }}
            />
            {emailError && <span style={{ color: 'red', fontSize: '12px', fontWeight: '500' }}>{emailError}</span>}
          </div>

          <input 
            type="password" 
            placeholder="Пароль" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '14px 18px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', cursor: 'pointer' }}>
              <input type="checkbox" style={{ transform: 'scale(1.1)' }} checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Запомни меня 🥰
            </label>

            <span 
              onClick={() => toggleMode(true)}
              style={{ color: '#7a9cb2', fontWeight: '600', cursor: 'pointer', userSelect: 'none' }}
            >
              Забыли пароль?
            </span>
          </div>

          <button type="submit" style={{ background: 'rgb(123, 171, 125)', color: '#fff', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '5px' }}>
            Войти
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#666' }}>
        Нет аккаунта? <Link to="/register" style={{ color: '#7a9cb2', fontWeight: 'bold', textDecoration: 'none' }}>Зарегистрироваться</Link>
      </p>
    </div>
    </div>
  );
}

//мне этот токен надоел 😡 зьюка)