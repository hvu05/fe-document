import API_CONFIG from '../config/api';
import type { Document, UploadedDocument } from '../types/document';
import axiosClient from './axiosClient';

export interface UploadResponse {
    message: string;
    document: UploadedDocument;
}

export interface GetDocumentsResponse {
    documents: UploadedDocument[];
}

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

        return axiosClient.post<UploadResponse>(
            API_CONFIG.documents.create,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
    },

    uploadDocument: (file: File, title: string, type: string) => {
        const formData = new FormData();
        formData.append(API_CONFIG.formFields.file, file);
        formData.append(API_CONFIG.formFields.title, title);
        formData.append(API_CONFIG.formFields.type, type);

        return axiosClient.post<UploadResponse>(
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
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
    },

    getDocuments: () => {
        return axiosClient.get<GetDocumentsResponse>('/documents');
    },

    deleteDocument: (id: number | string) => {
        return axiosClient.delete(`/documents/${id}`);
    },

    downloadVersion: (documentId: number, versionId: number) => {
        return axiosClient.get(
            API_CONFIG.documents.downloadVersion(documentId, versionId),
            {
                responseType: 'blob',
            }
        );
    },
};

export default documentService;
