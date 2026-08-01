import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl;
  }
  return 'https://workbench-8q5e.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
