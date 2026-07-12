import { getItemAsync, deleteItemAsync } from '../utils/storage';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

let API_BASE_URL = 'http://localhost:5000/api';
if (Platform.OS !== 'web') {
  const hostUri = Constants?.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    API_BASE_URL = `http://${ip}:5000/api`;
  } else {
    API_BASE_URL = 'http://192.168.1.8:5000/api';
  }
}

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

export const getImageUrl = (url) => {
  if (!url) return url;
  if (url.includes('localhost')) {
    const host = API_BASE_URL.replace('/api', '');
    return url.replace(/http:\/\/localhost:\d+/, host);
  }
  return url;
};

const api = new ApiService();
export default api;
