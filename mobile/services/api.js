import axios from 'axios';
import { getItemAsync, deleteItemAsync } from '../utils/storage';

import { Platform } from 'react-native';

// Jika berjalan di Browser Web (Laptop), gunakan localhost.
// Jika berjalan di HP (Android/iOS), gunakan Localtunnel.
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api' 
  : 'http://192.168.1.8:5000/api'; // Menggunakan IP Lokal WiFi agar bisa diakses dari HP

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true' // Mengizinkan localtunnel tanpa halaman peringatan
  },
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
