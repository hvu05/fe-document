import axiosClient from './axiosClient';
import type { Document } from '../types/document';
import API_CONFIG from '../config/api';

const documentService = {
    getMyDocuments: () => {
        return axiosClient.get<Document[]>(API_CONFIG.documents.myDocuments);
    },

    searchDocuments: (query: string) => {
        return axiosClient.get<Document[]>(API_CONFIG.documents.search, {
            params: { [API_CONFIG.queryKeys.search]: query },
        });
    },

    getDocument: (id: number) => {
        return axiosClient.get<Document>(API_CONFIG.documents.detail(id));
    },

    uploadNewDocument: (data: {
        title: string;
        type: string;
        departmentId: number;
        file: File;
    }) => {
        const formData = new FormData();
        formData.append(API_CONFIG.formFields.title, data.title);
        formData.append(API_CONFIG.formFields.type, data.type);
        formData.append(
            API_CONFIG.formFields.departmentId,
            String(data.departmentId)
        );
        formData.append(API_CONFIG.formFields.file, data.file);
        return axiosClient.post<Document>(
            API_CONFIG.documents.create,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
    },

    uploadNewVersion: (documentId: number, file: File) => {
        const formData = new FormData();
        formData.append(API_CONFIG.formFields.file, file);
        return axiosClient.post<Document>(
            API_CONFIG.documents.createVersion(documentId),
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    },

    deleteDocument: (id: number) => {
        return axiosClient.delete(API_CONFIG.documents.delete(id));
    },

    downloadVersion: (documentId: number, versionId: number) => {
        return axiosClient.get(
            API_CONFIG.documents.downloadVersion(documentId, versionId),
            { responseType: 'blob' }
        );
    },
};

export default documentService;
