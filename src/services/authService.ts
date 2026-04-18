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

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export type LoginResponse = ApiResponse<TokenResponse>;

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    departmentId: number;
    roles: Array<{
        id: string;
        roleName: string;
        description: string;
    }>;
}

// ===================== API Calls =====================

const authService = {
    getDepartments: () => {
        return axiosClient.get<DepartmentsResponse>('/v1/departments');
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
        return axiosClient.get<ApiResponse<UserProfile>>(API_CONFIG.auth.profile);
    },
};

export default authService;
