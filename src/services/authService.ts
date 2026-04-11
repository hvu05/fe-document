import axiosClient from './axiosClient';

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

// ===================== API Calls =====================

const authService = {
    getDepartments: () => {
        return axiosClient.get<DepartmentsResponse>('/departments');
    },

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
