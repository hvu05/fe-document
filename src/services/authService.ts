import axiosClient from './axiosClient';

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

// ===================== API Calls =====================

const authService = {
    register: (data: RegisterPayload) => {
        return axiosClient.post<RegisterResponse>('/auth/register', data);
    },

    login: (data: LoginPayload) => {
        return axiosClient.post<LoginResponse>('/auth/login', data);
    },

    getProfile: () => {
        return axiosClient.get('/auth/profile');
    },
};

export default authService;
