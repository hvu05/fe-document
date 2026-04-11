import axiosClient from './axiosClient';
import type { UploadedDocument } from '../types/document';

// ===================== Types =====================

export interface UploadResponse {
    message: string;
    document: UploadedDocument;
}

export interface GetDocumentsResponse {
    documents: UploadedDocument[];
}

// ===================== API Calls =====================

const documentService = {
    // Tải file lên server
    uploadDocument: (file: File, title: string, type: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('type', type);

        // AxiosClient đã được setup gắn cờ header token tự động
        // Content-Type cho FormData sẽ được Axios tự cấu hình
        return axiosClient.post<UploadResponse>('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // onUploadProgress: (progressEvent) => { ... } (Có thể làm thêm progress sau)
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
