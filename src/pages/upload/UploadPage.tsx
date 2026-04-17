/** @format */

import { useRef, useState } from 'react';
import type { UploadedDocument } from '../../types/document';
import documentService from '../../services/documentService';
import API_CONFIG from '../../config/api';
import styles from './UploadPage.module.css';

const DOCUMENT_TYPES = ['Contract', 'Report', 'Invoice', 'Other'];

const UploadPage = () => {
    const userStr = localStorage.getItem(API_CONFIG.storageKeys.user);
    let user: any = null;
    if (userStr && userStr !== 'undefined') {
        try {
            user = JSON.parse(userStr);
        } catch (e) {}
    }

    // Document list and its metadata
    const [documents, setDocuments] = useState<UploadedDocument[]>([]);
    const [title, setTitle] = useState<string>('');
    const [type, setType] = useState(DOCUMENT_TYPES[0]);
    const [departmentId, setDepartmentId] = useState<string>(
        user?.departmentId?.toString() ?? user?.department_id?.toString() ?? '1'
    );
    const [version, setVersion] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Status
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [success, setSuccess] = useState<string>('');

    const handleUpload = async () => {
        if (!title.trim()) {
            setError('Please enter a document title.');
            return;
        }
        if (!departmentId.trim() || Number(departmentId) <= 0) {
            setError('Please enter a valid department ID.');
            return;
        }
        if (!version.trim()) {
            setError('Please enter a valid version.');
            return;
        }
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        setError('');
        setSuccess('');

        try {
            setLoading(true);
            const userId = user?.id ?? user?._id ?? '';
            // API Connection
            const res = await documentService.uploadDocument(
                selectedFile,
                title.trim(),
                type,
                Number(departmentId),
                userId
            );

            let newDoc = res.data?.data;
            if (newDoc) {
                setDocuments((prev) => [newDoc, ...prev]);
                setSuccess('Document uploaded successfully!');
            }

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

    const resetMessages = () => {
        setError('');
        setSuccess('');
    };

    return (
        <div className={styles.page}>
            {/* ====== Left Panel: Upload Form ====== */}
            {/* ====== Right Panel: Document List ====== */}
            <main className={styles.rightPanel}>
                <div className={styles.formShell}>
                    <div className={styles.formCard}>
                        <div className={styles.formHeader}>
                            <div>
                                <h2 className={styles.formTitle}>
                                    Create a New Document
                                </h2>
                                <p className={styles.formSubtitle}>
                                    The system will create the document and its
                                    first version after upload
                                </p>
                            </div>
                        </div>

                        <div className={styles.form}>
                            <div className={styles.inputGrid}>
                                <label className={styles.label}>
                                    Title
                                    <input
                                        className={styles.input}
                                        type="text"
                                        placeholder="Enter document title..."
                                        value={title}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            resetMessages();
                                        }}
                                    />
                                </label>

                                <label className={styles.label}>
                                    Document Type
                                    <select
                                        className={styles.select}
                                        value={type}
                                        onChange={(e) =>
                                            setType(e.target.value)
                                        }
                                    >
                                        {DOCUMENT_TYPES.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className={styles.inputGrid}>
                                {/* //TODO: Get the department ID from user role*/}
                                <label className={styles.label}>
                                    Department ID
                                    <input
                                        className={styles.input}
                                        type="number"
                                        min="1"
                                        value={departmentId}
                                        disabled
                                    />
                                </label>
                                <label className={styles.label}>
                                    Version
                                    <input
                                        className={styles.input}
                                        type="text"
                                        placeholder="Enter version of the document"
                                        value={version}
                                        onChange={(e) => {
                                            setVersion(e.target.value);
                                            resetMessages();
                                        }}
                                    />
                                </label>
                            </div>
                            <label className={styles.label}>
                                Select File
                                <input
                                    ref={fileInputRef}
                                    className={styles.fileInput}
                                    type="file"
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0] ?? null;
                                        setSelectedFile(file);
                                        resetMessages();
                                    }}
                                />
                            </label>

                            {error && (
                                <p className={styles.errorMsg}>{error}</p>
                            )}
                            {success && (
                                <p className={styles.successMsg}>{success}</p>
                            )}

                            <button
                                className={styles.uploadBtn}
                                onClick={handleUpload}
                                disabled={
                                    loading ||
                                    !selectedFile ||
                                    !title.trim()
                                }
                            >
                                {loading
                                    ? 'Uploading...'
                                    : '⬆️ Upload New Document'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UploadPage;
