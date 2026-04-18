/** @format */

import { useRef, useState, useEffect } from 'react';
import type { UploadedDocument } from '../../types/document';
import documentService from '../../services/documentService';
import authService from '../../services/authService';
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
    const [departmentName, setDepartmentName] = useState<string>('Loading...');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Status
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [success, setSuccess] = useState<string>('');

    useEffect(() => {
        const fetchDepartmentInfo = async () => {
            try {
                // Fetch profile to get true department ID
                const profileRes = await authService.getProfile();
                const profile = (profileRes.data as any).data || profileRes.data;
                const dId = profile?.departmentId ?? profile?.department_id ?? departmentId;
                setDepartmentId(dId.toString());

                // Fetch departments to get the exact name
                const deptsRes = await authService.getDepartments();
                const depts = (deptsRes.data as any).data || deptsRes.data || [];
                const matched = depts.find((d: any) => d.id === Number(dId));

                if (matched) {
                    setDepartmentName(matched.name);
                } else {
                    setDepartmentName(`Department ID: ${dId}`);
                }
            } catch (err) {
                console.error('Failed to fetch department info', err);
                setDepartmentName(`Department ID: ${departmentId}`);
            }
        };
        fetchDepartmentInfo();
    }, []);

    const handleUpload = async () => {
        if (!title.trim()) {
            setError('Please enter a document title.');
            return;
        }
        if (!departmentId.trim() || Number(departmentId) <= 0) {
            setError('Please enter a valid department ID.');
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
                                <label className={styles.label}>
                                    Department
                                    <input
                                        className={styles.input}
                                        type="text"
                                        value={departmentName}
                                        disabled
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
                                        const file = e.target.files?.[0] ?? null;
                                        setSelectedFile(file);
                                        if (file && !title.trim()) {
                                            // Extract filename without extension for a cleaner title
                                            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                                            setTitle(nameWithoutExt);
                                        }
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
                                    loading || !selectedFile || !title.trim()
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
