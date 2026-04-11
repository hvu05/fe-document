import axiosClient from './axiosClient';
import API_CONFIG from '../config/api';

// ===================== Types =====================

export interface ApiResponse<T> {
    code: number;
    message: string;
    data?: T;
}

export interface Department {
    id: number;
    name: string;
}

export type DepartmentsResponse = ApiResponse<Department[]>;

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    departmentId: number | null;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface LoginPayload {
    username: string;
    password: string;
}

export type RegisterResponse = ApiResponse<void>;

export type LoginResponse = ApiResponse<TokenResponse>;

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
    getDepartments: () => {
        return axiosClient.get<DepartmentsResponse>(
            API_CONFIG.departments.list
        );
    },

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