import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Создаем клиент один раз
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api'
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функция для проверки профиля при загрузке
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await apiClient.get('/auth/profile');
      setUser(res.data);
    } catch (err) {
      console.error("Ошибка при проверке сессии:", err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Вход
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Выход
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // ОБНОВЛЕНИЕ ДАННЫХ (для Settings.jsx)
  const updateUser = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser, // Добавили сюда
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);