import axios from 'axios';
import { getItemAsync, deleteItemAsync } from '../utils/storage';

// Change this to your backend URL
const API_BASE_URL = 'http://192.168.1.13:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: attach JWT token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Storage not available
  }
  return config;
});

// Interceptor: handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteItemAsync('token');
    }
    return Promise.reject(error);
  }
);

export default api;
