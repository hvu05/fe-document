import axiosClient from './axiosClient';
import type { UploadedDocument } from '../types/document';

// ===================== Types =====================

export interface UploadResponse {
    code: number;
    message: string;
    data: UploadedDocument;
}

export interface GetDocumentsResponse {
    documents: UploadedDocument[];
}

// ===================== API Calls =====================

const documentService = {
    // Tải file lên server
    uploadDocument: async (
        file: File,
        title: string,
        type: string,
        departmentId: number,
        userId?: string
    ) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('type', type);
        formData.append('departmentId', departmentId.toString());
        if (userId) {
            formData.append('userId', userId);
        }

        // Dùng native fetch để vượt qua mọi lỗi của Axios Header/Interceptor
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const response = await fetch(`${baseURL}/documents/upload`, {
            method: 'POST',
            body: formData,
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data as UploadResponse;
    },

    // Lấy danh sách file (vd: cho mock hoặc thực)
    getDocuments: () => {
        return axiosClient.get<GetDocumentsResponse>('/documents');
    },

    // Lấy danh sách file của user
    getMyDocuments: () => {
        return axiosClient.get('/documents/me');
    },

    // Tìm kiếm file
    searchDocuments: (params: {
        title?: string;
        type?: string;
        departmentId?: number;
        startDate?: string;
        endDate?: string;
    }) => {
        return axiosClient.get('/documents/search', { params });
    },

    // Xoá document theo id
    deleteDocument: (id: string) => {
        return axiosClient.delete(`/documents/${id}`);
    },

    // Tải xuống file theo version
    downloadVersion: (documentId: number, versionId: number) => {
        return axiosClient.get(`/documents/${documentId}/versions/${versionId}/download`, {
            responseType: 'blob'
        });
    },

    // Tải phiên bản mới
    uploadNewVersion: async (documentId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post(`/documents/${documentId}/versions`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default documentService;
