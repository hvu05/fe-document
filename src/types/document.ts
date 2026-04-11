/** @format */

export interface UploadedDocument {
    id: string;
    title: string;
    type: string;
    fileName: string;
    fileSize: number; // bytes
    createdAt: Date;
    fileUrl: string;
}
