import axios from 'axios';

const API = axios.create({ 
  baseURL: 'gordeut-svye-daku2g2wg-marina-s-projects12.vercel.app',
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;