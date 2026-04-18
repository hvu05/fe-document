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

        const params: Record<string, any> = {
            title,
            type,
            departmentId,
        };
        // Optional user ID, depending on if the backend expects it. 
        if (userId) {
            params.userId = userId;
        }

        return axiosClient.post<UploadResponse>('/documents/upload', formData, {
            params,
        });
    },

    // Lấy danh sách file (vd: cho mock hoặc thực)
    getDocuments: () => {
        return axiosClient.get<GetDocumentsResponse>('/documents');
    },

    // Lấy danh sách file theo phòng ban
    getDepartmentDocuments: (departmentId: number) => {
        return axiosClient.get(`/documents/department/${departmentId}`);
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
    deleteDocument: (id: number) => {
        return axiosClient.delete(`/documents/${id}`);
    },

    // Tải xuống file theo version
    downloadVersion: (versionId: number) => {
        return axiosClient.get(`/documents/versions/${versionId}/download`, {
            responseType: 'blob'
        });
    },

    // Tải phiên bản mới
    uploadNewVersion: async (documentId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.put(`/documents/${documentId}`, formData);
    },

    // Lấy danh sách các phiên bản của một tài liệu
    getDocumentVersions: (documentId: number) => {
        return axiosClient.get(`/documents/${documentId}/versions`);
    },
};

export default documentService;
