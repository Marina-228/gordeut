import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import myIcon from '../assets/logo.png'; // Подключаем вашу личную иконку

export default function Sidebar() {
  const { user, loading } = useContext(AuthContext);
  const isAuth = !!user;

  // Функция для рендера ссылок с увеличенным шрифтом
  const renderLink = (to, label, icon) => (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 18px', // Увеличили отступы для крупных пунктов
        color: isActive ? '#2563eb' : '#374151',
        backgroundColor: isActive ? '#eff6ff' : 'transparent',
        textDecoration: 'none',
        borderRadius: '10px',
        fontSize: '17px', // Увеличен шрифт ссылок (было 15px)
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.2s ease',
      })}
    >
      <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div style={{
      width: '280px', // Немного расширил сайдбар под увеличенный шрифт
      height: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Эффекты наведения */}
      <style>{`
        .nav-menu a:hover {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
          transform: translateX(6px);
        }
        .nav-menu a.active:hover {
          background-color: #eff6ff !important;
          color: #2563eb !important;
        }
      `}</style>

      {/* Шапка с вашей личной иконкой из assets */}
      <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src={myIcon} 
          alt="Логотип" 
          style={{ 
            width: '32px', 
            height: '32px', 
            objectFit: 'contain' 
          }} 
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ padding: '0 18px', fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
            Главное
          </span>
          {renderLink('/', 'Обзор', '🏠')}
          {renderLink('/search', 'Поиск', '🔍')}
        </div>

        {/* Группа: Управление */}
        {(isAuth || (isAuth && user?.role === 'admin')) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ padding: '0 18px', fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
              Управление
            </span>
            {isAuth && user?.role === 'admin' && renderLink('/add-cottage', 'Добавить', '➕')}
            {isAuth && renderLink('/my-bookings', 'Брони', '📅')}
          </div>
        )}

        {/* Группа: Кабинет */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ padding: '0 18px', fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
            Кабинет
          </span>
          {renderLink('/settings', 'Настройки', '⚙️')}

          {/* Динамическая кнопка */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', color: '#9ca3af', fontSize: '17px' }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
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
        <div style={{
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
  );
}