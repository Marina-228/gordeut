import axios from 'axios';

const API = axios.create({ 
  baseURL: 'https://vercel.com/marina-s-projects12/gordeut-rzle/CbQPmBH5bpeyxSzpNxWmYorc8hPC',
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