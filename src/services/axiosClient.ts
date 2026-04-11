import axios from 'axios';
import API_CONFIG from '../config/api';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - automatically attach the Bearer token.
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(API_CONFIG.storageKeys.accessToken);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle common API errors.
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(API_CONFIG.storageKeys.accessToken);
            localStorage.removeItem(API_CONFIG.storageKeys.user);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
