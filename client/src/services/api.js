import axios from 'axios';
import { logout } from '../store/slices/authSlice';

let store;
export const injectStore = (_store) => { store = _store; };

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const isAuthError = error.response?.status === 401;
    const isAuthRoute = originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token');

    if (isAuthError && !isAuthRoute) {
      console.error("Erreur 401 sur une route protégée. Déconnexion automatique.");
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default apiClient;