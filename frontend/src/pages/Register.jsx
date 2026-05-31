import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [secretWord, setSecretWord] = useState(''); 
  const [secretWordHint, setSecretWordHint] = useState(''); 
  
  const [error, setError] = useState(null);          
  const [passwordError, setPasswordError] = useState(''); 
  const [confirmPasswordError, setConfirmPasswordError] = useState(''); 
  const [success, setSuccess] = useState(false);

  const validatePassword = (value) => {
    if (value.length === 0) return '';
    if (value.length < 6) return '😡 Минимум 6 символов';
    if (!/[A-ZА-Я]/.test(value)) return '😡 Нужна одна заглавная буква';
    if (!/[a-zа-я]/.test(value)) return '😡 Нужна одна строчная буква';
    if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(value)) return '😡 Нужен один спецсимвол (!@#$...)';
    return '🥰 Отличный пароль!';
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    const errMsg = validatePassword(value);
    setPasswordError(errMsg);

    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('😡 Пароли не совпадают');
    } else if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError('🥰 Пароли совпадают');
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (value.length === 0) {
      setConfirmPasswordError('');
    } else if (value !== password) {
      setConfirmPasswordError('😡 Пароли не совпадают');
    } else {
      setConfirmPasswordError('🥰 Пароли совпадают');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const finalCheck = validatePassword(password);
    if (finalCheck !== '🥰 Отличный пароль!') {
      setError('Пароль не соответствует требованиям безопасности.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли в обоих полях должны быть абсолютно одинаковыми.');
      return;
    }

    if (!secretWord.trim()) {
      setError('Пожалуйста, укажите ключевое слово для восстановления доступа.');
      return;
    }

    try {
      await API.post('/auth/register', { 
        name, 
        email, 
        password, 
        secretWord, 
        secretWordHint 
      });
      setSuccess(true);
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Ошибка при регистрации. Возможно, этот email занят.');
    }
  };

  const isEmailInvalid = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
      maxWidth: '640px',          
      padding: '40px 45px',       
      background: '#fff', 
      borderRadius: '16px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#2c3e50',
        fontSize: '24px',         
        marginBottom: '25px',     
        fontWeight: '600'
      }}>
        Регистрация
      </h2>
      
      {error && <div style={{ color: 'rgb(209, 74, 74)', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}> {error}</div>}
      {success && <div style={{ color: 'rgb(106, 161, 108)', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}> Аккаунт создан!</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* РЯД 1: Имя и Email */}
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="Ваше Имя" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '14px 18px', 
                borderRadius: '8px', 
                border: '1px solid #ccc',
                fontSize: '14px',     
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '14px 18px', 
                borderRadius: '8px', 
                border: isEmailInvalid ? '2px solid rgb(209, 74, 74)' : '1px solid #ccc',
                fontSize: '14px',   
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {isEmailInvalid && (
              <span style={{ fontSize: '12px', color: 'rgb(209, 74, 74)', fontWeight: '500' }}>
                😡 Некорректный email
              </span>
            )}
          </div>
        </div>
        
        {/* РЯД 2: Пароль и Повтор пароля */}
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input 
              type="password" 
              placeholder="Придумайте пароль" 
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '14px 18px', 
                borderRadius: '8px', 
                border: passwordError.startsWith('😡') ? '2px solid rgb(209, 74, 74)' : passwordError.startsWith('🥰') ? '2px solid rgb(123, 171, 125)' : '1px solid #ccc',
                fontSize: '14px',   
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {passwordError && (
              <span style={{ fontSize: '12px', color: passwordError.startsWith('🥰') ? 'rgb(106, 161, 108)' : 'rgb(209, 74, 74)', fontWeight: '500' }}>
                {passwordError}
              </span>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input 
              type="password" 
              placeholder="Повторите пароль" 
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '14px 18px', 
                borderRadius: '8px', 
                border: confirmPasswordError.startsWith('😡') ? '2px solid rgb(209, 74, 74)' : confirmPasswordError.startsWith('🥰') ? '2px solid rgb(123, 171, 125)' : '1px solid #ccc',
                fontSize: '14px',   
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {confirmPasswordError && (
              <span style={{ fontSize: '12px', color: confirmPasswordError.startsWith('🥰') ? 'rgb(106, 161, 108)' : 'rgb(209, 74, 74)', fontWeight: '500' }}>
                {confirmPasswordError}
              </span>
            )}
          </div>
        </div>

        {/* РЯД 3: Ключевое слово и Подсказка для него */}
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input 
              type="text" 
              placeholder="Ключевое слово" 
              value={secretWord}
              onChange={(e) => setSecretWord(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '14px 18px', 
                borderRadius: '8px', 
                border: '1px solid #ccc',
                fontSize: '14px',   
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '11px', color: '#7f8c8d', paddingLeft: '4px' }}>
              🔑 Ответ для сброса пароля
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input 
              type="text" 
              placeholder="Подсказка (необязательно)" 
              value={secretWordHint}
              onChange={(e) => setSecretWordHint(e.target.value)}
              style={{ 
                width: '100%',
                padding: '14px 18px', 
                borderRadius: '8px', 
                border: '1px solid #ccc',
                fontSize: '14px',   
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '11px', color: '#7f8c8d', paddingLeft: '4px' }}>
              💡 Например: «Основные принципы ооп»
            </span>
          </div>
        </div>

        <button 
          type="submit" 
          style={{ 
            background: 'rgb(106, 161, 108)', 
            color: '#fff', 
            border: 'none', 
            padding: '15px',      
            borderRadius: '8px', 
            fontWeight: 'bold', 
            fontSize: '16px',     
            cursor: 'pointer', 
            transition: 'background 0.2s',
            marginTop: '10px' 
          }}
        >
          Зарегистрироваться
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#666' }}>
        Уже есть аккаунт? <Link to="/login" style={{ color: '#6e9ab8', fontWeight: 'bold', textDecoration: 'none' }}>Войти</Link>
      </p>
    </div>
    </div>
  );
}