import axiosClient from './axiosClient';
import API_CONFIG from '../config/api';

// ===================== Types =====================

export interface Department {
    id: number;
    name: string;
}

export interface DepartmentsResponse {
    code: number;
    message: string;
    data: Department[];
}

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    departmentId: number;
}

export interface RegisterResponse {
    code: number;
    message: string;
}

export interface LoginPayload {
    username: string; // email, username hoặc phone
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
    getDepartments: () => {
        return axiosClient.get<DepartmentsResponse>('/departments');
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
