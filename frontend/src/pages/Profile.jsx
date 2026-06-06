import { useContext, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import Notification from '../components/Notification'; // Ваш компонент уведомлений
import ConfirmModal from '../components/ConfirmModal'; // Ваш компонент модалки
import './Profile.css';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Состояния для уведомлений и модалки
  const [notification, setNotification] = useState({ message: null, isSuccess: false });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Инициализация лайков
  const [likes, setLikes] = useState(() => {
    const savedLikes = localStorage.getItem('profile-likes');
    return savedLikes ? parseInt(savedLikes, 10) : 0;
  });
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    localStorage.setItem('profile-likes', likes);
  }, [likes]);

  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Функция удаления, вызываемая из модалки
  const confirmDelete = async () => {
    try {
      await API.delete('/auth/delete-account');
      logout();
      navigate('/login');
    } catch (err) {
      setNotification({ message: "Ошибка при удалении аккаунта", isSuccess: false });
      setIsModalOpen(false);
    }
  };

  const handleLike = () => {
    setLikes(prev => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-container">
      {/* Уведомления */}
      {notification.message && (
        <Notification 
          message={notification.message} 
          isSuccess={notification.isSuccess} 
          onClose={() => setNotification({ message: null, isSuccess: false })} 
        />
      )}

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal 
        isOpen={isModalOpen}
        title="Удаление аккаунта"
        message="Вы уверены, что хотите удалить аккаунт? Это действие необратимо."
        onConfirm={confirmDelete}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{userInitial}</div>
          <h2>Личный кабинет</h2>
          
          <button 
            className={`like-button ${isLiked ? 'liked' : ''}`} 
            onClick={handleLike}
            aria-label="Поставить лайк"
          >
            <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>
            <span className="like-count">{likes}</span>
          </button>
        </div>
        
        <div className="profile-info">
          <div className="info-group">
            <span className="info-label">Имя</span>
            <span className="info-value">{user.name || 'Пользователь'}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email}</span>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="btn btn-logout" onClick={handleLogout}>
            Выйти из аккаунта
          </button>
          <button className="btn btn-delete" onClick={() => setIsModalOpen(true)}>
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}