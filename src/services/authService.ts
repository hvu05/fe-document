import axiosClient from './axiosClient';
import API_CONFIG from '../config/api';

// ===================== Types =====================

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    phone?: string;
}

export interface RegisterResponse {
    message: string;
    userId: string;
}

export interface LoginPayload {
    identifier: string; // email, username hoặc phone
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: {
        _id: string;
        username: string;
        email: string;
        role: string;
    };
}

export interface UserProfile {
    _id?: string;
    id?: string;
    username?: string;
    email?: string;
    role?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    department_id?: number;
    departmentId?: number;
    created_at?: string;
    createdAt?: string;
}

// ===================== API Calls =====================

const authService = {
    register: (data: RegisterPayload) => {
        return axiosClient.post<RegisterResponse>(
            API_CONFIG.auth.register,
            data
        );
    },

    login: (data: LoginPayload) => {
        return axiosClient.post<LoginResponse>(API_CONFIG.auth.login, data);
    },

    getProfile: () => {
        return axiosClient.get<UserProfile>(API_CONFIG.auth.profile);
    },
};

export default authService;
