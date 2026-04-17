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
    uploadDocument: (
        file: File,
        title: string,
        type: string,
        departmentId: number,
        userId: string
    ) => {
        const formData = new FormData();
        formData.append('file', file);

        return axiosClient.post<UploadResponse>('/documents/upload', formData, {
            params: {
                title,
                type,
                departmentId,
                userId,
            },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Lấy danh sách file (vd: cho mock hoặc thực)
    getDocuments: () => {
        return axiosClient.get<GetDocumentsResponse>('/documents');
    },

    // Xoá document theo id
    deleteDocument: (id: string) => {
        return axiosClient.delete(`/documents/${id}`);
    },
};

export default documentService;
