import { useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios'; // Предполагаем, что у вас есть настроенный axios

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 1. Защита роута: если пользователя нет, перекидываем на логин
  if (!user) return <Navigate to="/login" replace />;

  // 2. Обработчик выхода
  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  // 3. Обработчик удаления аккаунта (если решили добавить)
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

  return (
    <div style={{ padding: '20px' }}>
      <h2>👤 Личный кабинет</h2>
      <p><strong>Имя:</strong> {user.name || 'Пользователь'}</p>
      <p><strong>Email:</strong> {user.email}</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={handleLogout} style={{ padding: '8px 16px' }}>
          Выйти
        </button>
        
        <button 
          onClick={handleDelete} 
          style={{ padding: '8px 16px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Удалить аккаунт
        </button>
      </div>
    </div>
  );
}