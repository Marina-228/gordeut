import { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import myIcon from '../assets/logo.png'; // Подключаем вашу личную иконку

export default function Sidebar() {
  const { user, loading } = useContext(AuthContext);
  const isAuth = !!user;
  
  // Состояние для открытия/закрытия выдвижной панели на мобилках
  const [isOpen, setIsOpen] = useState(false);

  // Функция для рендера ссылок (при клике автоматически закрывает меню)
  const renderLink = (to, label, icon) => (
    <NavLink 
      to={to} 
      className="sidebar-link"
      onClick={() => setIsOpen(false)}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 18px',
        color: isActive ? '#2563eb' : '#374151',
        backgroundColor: isActive ? '#eff6ff' : 'transparent',
        textDecoration: 'none',
        borderRadius: '10px',
        fontSize: '17px',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.2s ease',
      })}
    >
      <span className="sidebar-icon" style={{ display: 'flex', alignItems: 'center', fontSize: '20px' }}>{icon}</span>
      <span className="sidebar-text">{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Кнопка открытия меню (гамбургер) — видна ТОЛЬКО на мобильных */}
      <button 
        className="mobile-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          top: '16px',
          left: '16px',
          zIndex: 10000,
          width: '46px',
          height: '46px',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Задний полупрозрачный фон при открытом меню на мобилках */}
      {isOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', // Заменили с relative
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(3px)',
              zIndex: 9998,
            }}
          />
        )}


      {/* Основной контейнер сайдбара */}
      <div 
        className={`sidebar-container ${isOpen ? 'mobile-open' : ''}`}
        style={{
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Адаптивные стили и медиа-запросы */}
        <style>{`
  /* Стили для компьютеров (фиксированный сайдбар) */
  @media (min-width: 769px) {
    .mobile-toggle-btn, .mobile-overlay { display: none !important; }
    .sidebar-container {
      width: 280px;
      height: 100vh;
      border-right: 1px solid #e5e7eb;
      position: sticky; /* Идеально для боковой панели */
      top: 0;
      flex-shrink: 0;
    }
  }

  /* Стили для мобильных (выдвижной режим) */
  @media (max-width: 768px) {
    .sidebar-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      z-index: 9999;
      background: white;
      border-right: 1px solid #e5e7eb;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
      padding-top: 20px;
      transform: translateX(-100%);
      /* Добавляем плавность */
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .sidebar-container.mobile-open {
      transform: translateX(0);
    }

    /* Чтобы контент не "прятался" под кнопку гамбургера */
    .mobile-toggle-btn {
      position: fixed !important;
    }
  }
`}</style>
        {/* Шапка с вашей личной иконкой */}
        <div className="logo-section" style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={myIcon} 
            alt="Логотип" 
            style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
          />
          <span style={{ fontSize: '23px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
            Гордеют
          </span>
        </div>

        {/* Меню навигации */}
        <nav className="nav-menu" style={{ 
          flex: 1, 
          padding: '0 14px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '28px' 
        }}>
          {/* Группа: Главное */}
          <div className="menu-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="group-title" style={{ padding: '0 18px', fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
              Главное
            </span>
            {renderLink('/', 'Обзор', '🏠')}
            {renderLink('/search', 'Поиск', '🔍')}
          </div>

          {/* Группа: Управление */}
          {(isAuth || (isAuth && user?.role === 'admin')) && (
            <div className="menu-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="group-title" style={{ padding: '0 18px', fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                Управление
              </span>
              {isAuth && user?.role === 'admin' && renderLink('/add-cottage', 'Добавить', '➕')}
              {isAuth && renderLink('/my-bookings', 'Брони', '📅')}
            </div>
          )}

          {/* Группа: Кабинет */}
          <div className="menu-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="group-title" style={{ padding: '0 18px', fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
              Кабинет
            </span>
            {renderLink('/settings', 'Настройки', '⚙️')}

            {/* Динамическая кнопка */}
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', color: '#9ca3af', fontSize: '17px' }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                <span>Загрузка...</span>
              </div>
            ) : isAuth ? (
              renderLink('/profile', 'Профиль', '👤')
            ) : (
              renderLink('/login', 'Войти', '🔑')
            )}
          </div>
        </nav>

        {/* Нижняя панель пользователя */}
        {isAuth && !loading && (
          <div className="sidebar-footer" style={{
            padding: '18px',
            margin: '14px',
            backgroundColor: '#f9fafb',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              👤
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Пользователь'}
              </span>
              <span style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>
                {user?.role === 'admin' ? 'Администратор' : 'Клиент'}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}