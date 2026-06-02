import { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import logo from '../assets/logo.png'; 

export default function Sidebar() {
  // Добавляем loading, чтобы правильно обрабатывать состояние проверки токена
  const { user, loading } = useContext(AuthContext); 
  const isAuth = !!user;

  const getLinkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? 'rgb(123, 171, 125)' : '#333',
    fontWeight: isActive ? '700' : '500',
    padding: '10px 15px',
    borderRadius: '8px',
    background: isActive ? 'rgba(123, 171, 125, 0.1)' : 'transparent',
    transition: 'all 0.2s'
  });

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #eee',
      padding: '25px',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
      boxSizing: 'border-box'
    }}>
      {/* Логотип */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logo} alt="Логотип" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: '#000000', fontFamily: "'Segoe UI', sans-serif" }}>
          Гордеют
        </h2>
      </div>

      {/* Блок пользователя с обработкой состояния загрузки */}
      {loading ? (
        <div style={{ padding: '10px 0', fontSize: '14px', color: '#888' }}>Загрузка...</div>
      ) : isAuth ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 0' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgb(123, 171, 125)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Пользователь'}
            </div>
            <Link to="/profile" style={{ fontSize: '12px', color: '#7a9cb2', textDecoration: 'none' }}>Личный кабинет</Link>
          </div>
        </div>
      ) : (
        <Link to="/login" style={{ 
          display: 'block',
          width: '100%', 
          padding: '14px 0', 
          fontSize: '15px',
          background: 'rgb(123, 171, 125)', 
          borderRadius: '10px', 
          textAlign: 'center', 
          color: '#fff', 
          textDecoration: 'none', 
          fontWeight: '600'
        }}>
          Войти в аккаунт
        </Link>
      )}

      {/* Меню навигации */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <NavLink to="/" style={getLinkStyle}>🏠 Обзор</NavLink>
        <NavLink to="/search" style={getLinkStyle}>🔍 Поиск домов</NavLink>
        
        {/* Проверка роли */}
        {isAuth && user?.role === 'admin' && (
          <NavLink to="/add-cottage" style={getLinkStyle}>➕ Добавить дом</NavLink>
        )}
        
        {isAuth && <NavLink to="/my-bookings" style={getLinkStyle}>📅 Мои бронирования</NavLink>}
        
        <NavLink to="/settings" style={getLinkStyle}>⚙️ Настройки</NavLink>
      </nav>
    </div>
  );
}