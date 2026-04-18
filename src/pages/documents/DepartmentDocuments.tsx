import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import API_CONFIG from '../../config/api';
import type { Document } from '../../types/document';
import styles from './MyDocuments.module.css';

function formatFileSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
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

const DepartmentDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    // Upload new version modal
    const [versionModal, setVersionModal] = useState<Document | null>(null);
    const [versionFile, setVersionFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem(API_CONFIG.storageKeys.user);
            let deptId = 1; // Default
            if (userStr && userStr !== 'undefined') {
                try {
                    const user = JSON.parse(userStr);
                    if (user.departmentId != null) deptId = user.departmentId;
                } catch(e) {}
            }
            const res = await documentService.getDepartmentDocuments(deptId);
            setDocuments(res.data.data || []);
        } catch {
            console.error('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this document?'))
            return;
        try {
            await documentService.deleteDocument(id);
            setDocuments((prev) => prev.filter((d) => d.id !== id));
        } catch {
            alert('Failed to delete document');
        }
    };

    const handleDownload = async (doc: any) => {
        const latestId = (doc as any).currentVersion ?? doc.latestVersion?.id ?? doc.versions?.[0]?.id;
        if (!latestId) return;
        try {
            const res = await documentService.downloadVersion(
                doc.id,
                latestId
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName || doc.latestVersion?.fileName || doc.versions?.[0]?.fileName || `${doc.title}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            alert('Download failed');
        }
    };

    const handleUploadVersion = async () => {
        if (!versionModal || !versionFile) return;
        try {
            await documentService.uploadNewVersion(
                versionModal.id,
                versionFile
            );
            setVersionModal(null);
            setVersionFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchDocuments();
        } catch {
            alert('Failed to upload new version');
        }
    };

    const getNextVersion = (doc: any): number => {
        if (doc.currentVersion) return doc.currentVersion + 1;
        if (!doc.versions || doc.versions.length === 0) return 1;
        return Math.max(...doc.versions.map((v: any) => v.versionNumber)) + 1;
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Department Documents</h1>
                    <span className={styles.count}>
                        {documents.length} documents
                    </span>
                </div>
                <Link to="/upload" className={styles.uploadBtn}>
                    <span>⬆️</span> Upload New Document
                </Link>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : documents.length === 0 ? (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>📂</span>
                    <span className={styles.emptyText}>
                        You have not uploaded any documents yet
                    </span>
                    <Link to="/upload" className={styles.uploadBtn}>
                        Upload Now
                    </Link>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Version</th>
                                <th>Size</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => {
                                const latest =
                                    doc.latestVersion ?? doc.versions?.[0];
                                return (
                                    <tr key={doc.id}>
                                        <td>{doc.title}</td>
                                        <td>
                                            <span
                                                className={typeBadgeClass(
                                                    doc.type ?? ''
                                                )}
                                            >
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={styles.versionBadge}
                                            >
                                                v{(doc as any).currentVersion ?? latest?.versionNumber ?? 1}
                                            </span>
                                        </td>
                                        <td className={styles.fileSize}>
                                            {formatFileSize((doc as any).fileSize ?? latest?.fileSize ?? 0)}
                                        </td>
                                        <td>
                                            {doc.createdAt
                                                ? formatDate(doc.createdAt)
                                                : '—'}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.btnView}
                                                    title="View"
                                                >
                                                    👁 View
                                                </button>
                                                <button
                                                    className={
                                                        styles.btnDownload
                                                    }
                                                    onClick={() =>
                                                        handleDownload(doc)
                                                    }
                                                    title="Download"
                                                >
                                                    ⬇ Download
                                                </button>
                                                <button
                                                    className={
                                                        styles.btnUploadVersion
                                                    }
                                                    onClick={() =>
                                                        setVersionModal(doc)
                                                    }
                                                    title="Upload new version"
                                                >
                                                    📤 New Version
                                                </button>
                                                <button
                                                    className={styles.btnDelete}
                                                    onClick={() =>
                                                        handleDelete(doc.id)
                                                    }
                                                    title="Delete"
                                                >
                                                    🗑 Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* New version upload modal */}
            {versionModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setVersionModal(null)}
                >
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className={styles.modalTitle}>
                            Upload New Version - {versionModal.title}
                        </h3>
                        <div className={styles.modalField}>
                            <label className={styles.modalLabel}>Version</label>
                            <input
                                className={styles.modalInput}
                                type="text"
                                value={`v${getNextVersion(versionModal)}`}
                                disabled
                            />
                        </div>
                        <div className={styles.modalField}>
                            <label className={styles.modalLabel}>
                                Select File
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={(e) =>
                                    setVersionFile(e.target.files?.[0] ?? null)
                                }
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalBtnCancel}
                                onClick={() => {
                                    setVersionModal(null);
                                    setVersionFile(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.modalBtnPrimary}
                                onClick={handleUploadVersion}
                                disabled={!versionFile}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentDocuments;
