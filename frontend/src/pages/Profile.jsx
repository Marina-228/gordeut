import { useContext, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Инициализация лайков из localStorage
  const [likes, setLikes] = useState(() => {
    const savedLikes = localStorage.getItem('profile-likes');
    return savedLikes ? parseInt(savedLikes, 10) : 0;
  });

  const [isLiked, setIsLiked] = useState(false);

  // Синхронизация с localStorage при изменении количества лайков
  useEffect(() => {
    localStorage.setItem('profile-likes', likes);
  }, [likes]);

  // Защита роута
  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить аккаунт? Это действие необратимо.")) {
      try {
        await API.delete('/auth/delete-account');
        logout();
        navigate('/login');
      } catch (err) {
        alert("Ошибка при удалении аккаунта");
      }
    }
  };

  const handleLike = () => {
    setLikes(prev => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-container">
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
          <button className="btn btn-delete" onClick={handleDelete}>
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}