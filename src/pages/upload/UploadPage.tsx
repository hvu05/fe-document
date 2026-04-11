/** @format */

import { useRef, useState, useEffect } from 'react';
import type { UploadedDocument } from '../../types/document';
import documentService from '../../services/documentService';
import styles from './UploadPage.module.css';

const DOCUMENT_TYPES = ['Contract', 'Report', 'Invoice', 'Other'];

const MOCK_DOCUMENTS: UploadedDocument[] = [
    {
        id: 'mock-1',
        title: 'Q1 Financial Report',
        type: 'Report',
        fileName: 'q1-report-2026.pdf',
        fileSize: 204800,
        createdAt: new Date('2026-03-15T09:00:00'),
        fileUrl: '',
    },
    {
        id: 'mock-2',
        title: 'Vendor Contract - ABC Corp',
        type: 'Contract',
        fileName: 'vendor-abc-contract.docx',
        fileSize: 102400,
        createdAt: new Date('2026-04-01T14:30:00'),
        fileUrl: '',
    },
];

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function typeBadgeClass(type: string): string {
    const map: Record<string, string> = {
        Contract: styles.contract,
        Report: styles.report,
        Invoice: styles.invoice,
        Other: styles.other,
    };
    return `${styles.typeBadge} ${map[type] ?? ''}`;
}

const UploadPage = () => {
    const [documents, setDocuments] = useState<UploadedDocument[]>(MOCK_DOCUMENTS); // In reality, we fetch via useEffect
    const [title, setTitle] = useState('');
    const [type, setType] = useState(DOCUMENT_TYPES[0]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleUpload = async () => {
        if (!title.trim()) {
            setError('Please enter a document title.');
            return;
        }
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }
        setError('');

        try {
            setLoading(true);
            const res = await documentService.uploadDocument(selectedFile, title.trim(), type);
            
            // Khi upload thành công (Giả lập response trả về document mới)
            // Trong thực tế sẽ setDocuments([res.data.document, ...documents])
            
            // Xử lý mock để UI được mượt
            let newDoc = res.data?.document;
            if(!newDoc) {
                 newDoc = {
                    id: `doc-${Date.now()}`,
                    title: title.trim(),
                    type,
                    fileName: selectedFile.name,
                    fileSize: selectedFile.size,
                    createdAt: new Date(),
                    fileUrl: URL.createObjectURL(selectedFile),
                 }
            }

            setDocuments((prev) => [newDoc, ...prev]);
            setTitle('');
            setType(DOCUMENT_TYPES[0]);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (err: unknown) {
             console.error(err);
             setError('Failed to upload document.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // await documentService.deleteDocument(id);
            setDocuments((prev) => {
                const doc = prev.find((d) => d.id === id);
                if (doc?.fileUrl) URL.revokeObjectURL(doc.fileUrl);
                return prev.filter((d) => d.id !== id);
            });
        } catch (error) {
             console.error('Delete error', error);
        }
    };

    const handleDownload = (doc: UploadedDocument) => {
        if (!doc.fileUrl) return;
        const a = document.createElement('a');
        a.href = doc.fileUrl;
        a.download = doc.fileName;
        a.click();
    };

    return (
        <div className={styles.page}>
            {/* ====== Left Panel: Upload Form ====== */}
            <aside className={styles.leftPanel}>
                <h2 className={styles.panelTitle}>Upload Document</h2>
                <div className={styles.form}>
                    <label className={styles.label}>
                        Title
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Enter document title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </label>

                    <label className={styles.label}>
                        Document Type
                        <select
                            className={styles.select}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            {DOCUMENT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.label}>
                        File
                        <input
                            ref={fileInputRef}
                            className={styles.fileInput}
                            type="file"
                            onChange={(e) =>
                                setSelectedFile(e.target.files?.[0] ?? null)
                            }
                        />
                    </label>

                    {error && <p className={styles.errorMsg}>{error}</p>}

                    <button
                        className={styles.uploadBtn}
                        onClick={handleUpload}
                        disabled={!title.trim() || !selectedFile || loading}
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </aside>

            {/* ====== Right Panel: Document List ====== */}
            <main className={styles.rightPanel}>
                <div className={styles.rightHeader}>
                    <h1 className={styles.rightTitle}>Uploaded Documents</h1>
                    <span className={styles.count}>
                        {documents.length}{' '}
                        {documents.length === 1 ? 'document' : 'documents'}
                    </span>
                </div>

                {documents.length === 0 ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>📂</span>
                        <span className={styles.emptyText}>
                            No documents uploaded yet
                        </span>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>File Name</th>
                                    <th>Size</th>
                                    <th>Uploaded At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>{doc.title}</td>
                                        <td>
                                            <span
                                                className={typeBadgeClass(
                                                    doc.type
                                                )}
                                            >
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td>{doc.fileName}</td>
                                        <td className={styles.fileSize}>
                                            {formatFileSize(doc.fileSize)}
                                        </td>
                                        <td>{formatDate(doc.createdAt)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={
                                                        styles.btnDownload
                                                    }
                                                    onClick={() =>
                                                        handleDownload(doc)
                                                    }
                                                    disabled={!doc.fileUrl}
                                                    title="Download"
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    className={styles.btnDelete}
                                                    onClick={() =>
                                                        handleDelete(doc.id)
                                                    }
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UploadPage;
