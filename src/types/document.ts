/** @format */

export interface DocumentVersion {
    id: number;
    documentId: number;
    versionNumber: number;
    filePath: string;
    fileName: string;
    fileSize: number;
    uploadedBy: string;
    createdAt: string;
}

export interface Document {
    id: number;
    title: string;
    type: string;
    departmentId: number;
    createdBy: string;
    createdAt: string;
    versions: DocumentVersion[];
    latestVersion?: DocumentVersion;
}

// Keep for backward compat with mock data
export interface UploadedDocument {
    id: string;
    title: string;
    type: string;
    departmentId: number;
    createdBy: string;
    // The top-level file info can represent the latest version
    fileName: string;
    fileSize: number;
    createdAt: Date;
    fileUrl: string;
    versionHistory: {
        version: string;
        fileName: string;
        fileSize: number;
        createdAt: Date;
        fileUrl: string;
    }[];
}