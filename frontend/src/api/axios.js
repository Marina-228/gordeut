import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // БЕЗ ЭТОЙ СТРОКИ сервер не узнает, кто вы
  }
  return config;
});

export default API;