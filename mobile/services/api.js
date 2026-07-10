import { getItemAsync, deleteItemAsync } from '../utils/storage';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api' 
  : 'http://192.168.1.8:5000/api';

class ApiService {
  constructor() {
    this.defaults = { baseURL: API_BASE_URL };
  }

  async request(endpoint, options = {}) {
    const token = await getItemAsync('token');
    
    const headers = {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${this.defaults.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        await deleteItemAsync('token');
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.error || `HTTP Error ${response.status}`);
        error.response = { data, status: response.status };
        throw error;
      }

      return { data, status: response.status };
    } catch (error) {
      if (!error.response) {
        // Network error format matching axios
        error.response = undefined;
      }
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

const api = new ApiService();
export default api;
