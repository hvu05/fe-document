export const API_CONFIG = {
    // Set your backend base URL in VITE_API_BASE_URL, for example:
    // VITE_API_BASE_URL=http://localhost:3000/api
    auth: {
        register: '/auth/register',
        login: '/auth/login',
        profile: '/auth/profile',
    },
    documents: {
        myDocuments: '/documents/my',
        search: '/documents/search',
        create: '/documents',
        detail: (documentId: number) => `/documents/${documentId}`,
        delete: (documentId: number) => `/documents/${documentId}`,
        createVersion: (documentId: number) =>
            `/documents/${documentId}/versions`,
        downloadVersion: (documentId: number, versionId: number) =>
            `/documents/${documentId}/versions/${versionId}/download`,
    },
    queryKeys: {
        search: 'q',
    },
    formFields: {
        title: 'title',
        type: 'type',
        departmentId: 'departmentId',
        file: 'file',
    },
    storageKeys: {
        accessToken: 'access_token',
        user: 'user',
    },
} as const;

export default API_CONFIG;
