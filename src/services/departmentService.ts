import API_CONFIG from '../config/api';
import type { Department } from '../types/document';
import axiosClient from './axiosClient';

const departmentService = {
    getDepartments: () => {
        return axiosClient.get<Department[]>(API_CONFIG.departments.list);
    },
};

export default departmentService;
