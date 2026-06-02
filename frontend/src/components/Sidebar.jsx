import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user, loading } = useContext(AuthContext);
  const isAuth = !!user;

  // Функция для рендера ссылок
  const renderLink = (to, label, icon) => (
    <NavLink to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-text">{label}</span>
    </NavLink>
  );

  return (
    <div className="sidebar-wrapper">
      <div className="logo-section">Гордеют</div>

      <nav className="nav-menu">
        {renderLink('/', 'Обзор', '🏠')}
        {renderLink('/search', 'Поиск', '🔍')}
        
        {isAuth && user?.role === 'admin' && renderLink('/add-cottage', 'Добавить', '➕')}
        {isAuth && renderLink('/my-bookings', 'Брони', '📅')}
        
        {renderLink('/settings', 'Настр.', '⚙️')}

        {/* ДИНАМИЧЕСКАЯ КНОПКА: Профиль или Вход */}
        {loading ? (
          <div className="nav-link">⏳</div>
        ) : isAuth ? (
          renderLink('/profile', 'Профиль', '👤')
        ) : (
          renderLink('/login', 'Войти', '🔑')
        )}
      </nav>
    </div>
  );
}