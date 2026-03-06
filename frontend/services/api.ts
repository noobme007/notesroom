import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getFirebaseAuth } from '@/lib/firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const user = typeof window !== 'undefined' ? getFirebaseAuth().currentUser : null;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let individual components handle errors — do NOT globally redirect
    // A 401 on room fetches was causing an infinite redirect loop
    return Promise.reject(error);
  }
);

export default api;
