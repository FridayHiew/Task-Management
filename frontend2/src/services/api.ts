import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Check if we're in browser environment (prevents build-time errors)
const isBrowser = typeof window !== 'undefined';

// 请求拦截器 - 添加 token (with client-side check)
api.interceptors.request.use(
  (config) => {
    // Only access localStorage in browser environment
    if (isBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 处理 401 (with client-side check)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle redirects in browser environment
    if (isBrowser && error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;