import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import './Settings.css';

export default function Settings() {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: true
  });
  const [message, setMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put('/auth/update-profile', { name: formData.name });
      updateUser(response.data);
      setMessage('Настройки сохранены! ✨');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Ошибка сохранения ❌');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Настройки аккаунта</h1>
        <p>Управляйте своими данными и предпочтениями</p>
      </div>

      <form onSubmit={handleSave} className="settings-grid">
        {/* Карточка профиля */}
        <div className="settings-card">
          <h3>Профиль</h3>
          <div className="input-group">
            <label>Имя пользователя</label>
            <input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="settings-input"
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input disabled value={formData.email} className="settings-input disabled" />
          </div>
        </div>

        {/* Карточка уведомлений */}
        <div className="settings-card">
          <h3>Уведомления</h3>
          <div className="toggle-group">
            <span>Получать email-рассылку</span>
            <div 
              className={`toggle ${formData.notifications ? 'active' : ''}`}
              onClick={() => setFormData({...formData, notifications: !formData.notifications})}
            >
              <div className="toggle-thumb" />
            </div>
          </div>
        </div>

        <button type="submit" className="save-btn">Сохранить изменения</button>
        {message && <div className="status-toast">{message}</div>}
      </form>
    </div>
  );
}