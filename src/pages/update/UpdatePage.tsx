import { useRef, useState } from 'react';
import type { UploadedDocument } from '../../types/document';
import documentService from '../../services/documentService';
import styles from './UpdatePage.module.css';

import API_CONFIG from '../../config/api';

const DOCUMENT_TYPES = ['Contract', 'Report', 'Invoice', 'Other'];

const UpdatePage = () => {
    const userStr = localStorage.getItem(API_CONFIG.storageKeys.user);
    let user: any = null;
    if (userStr && userStr !== 'undefined') {
        try {
            user = JSON.parse(userStr);
        } catch (e) {}
    }

    // Document list and its metadata
    const [documents, setDocuments] = useState<UploadedDocument[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);
    const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
    const [version, setVersion] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Status
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [success, setSuccess] = useState<string>('');

    const handleUpload = async () => {
        if (!selectedDocId) {
            setError('Please select a document.');
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
                selectedDoc.title,
                selectedDoc.type,
                selectedDoc.departmentId,
                userId
            );

            if (selectedDoc) {
                const updatedDoc = {
                    ...selectedDoc,
                    fileName: selectedFile.name,
                    fileSize: selectedFile.size,
                    createdAt: new Date(),
                    fileUrl: URL.createObjectURL(selectedFile),
                    versionHistory: [
                        ...(selectedDoc.versionHistory || []),
                        {
                            version: version,
                            fileName: selectedFile.name,
                            fileSize: selectedFile.size,
                            createdAt: new Date(),
                            fileUrl: URL.createObjectURL(selectedFile),
                        },
                    ],
                };

                setDocuments((prev) =>
                    prev.map((doc) =>
                        doc.id === selectedDocId ? updatedDoc : doc
                    )
                );
                setSelectedDoc(updatedDoc);
            }

            setVersion('');
            setSelectedFile(null);
            setSuccess('Version uploaded successfully!');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: unknown) {
            console.error(err);
            setError('Failed to upload version.');
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
            {/* ====== Main Panel: Update Version Form ====== */}
            <main className={styles.rightPanel}>
                <div className={styles.formShell}>
                    <div className={styles.formCard}>
                        <div className={styles.formHeader}>
                            <div>
                                <h2 className={styles.formTitle}>
                                    Upload a New Version
                                </h2>
                                <p className={styles.formSubtitle}>
                                    Select an existing document and upload a new
                                    version. The system will automatically track
                                    the version history.
                                </p>
                            </div>
                            <div className={styles.formBadge}>
                                Append next version
                            </div>
                        </div>

                        <div className={styles.form}>
                            <label className={styles.label}>
                                Select an Existing Document
                            </label>
                            {loadingDocs ? (
                                <div className={styles.loading}>
                                    Loading document list...
                                </div>
                            ) : documents.length === 0 ? (
                                <div className={styles.loading}>
                                    You do not have any documents yet.{' '}
                                    <a href="/upload">
                                        Upload a New Document
                                    </a>
                                </div>
                            ) : (
                                <div className={styles.docSelector}>
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className={`${styles.docOption} ${
                                                selectedDocId === doc.id
                                                    ? styles.docOptionSelected
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                setSelectedDocId(doc.id);
                                                setSelectedDoc(doc);
                                                resetMessages();
                                            }}
                                        >
                                            <div
                                                className={
                                                    styles.docOptionInfo
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.docOptionTitle
                                                    }
                                                >
                                                    {doc.title}
                                                </span>
                                                <span
                                                    className={
                                                        styles.docOptionMeta
                                                    }
                                                >
                                                    {doc.type}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedDoc && (
                                <div className={styles.selectedDocumentCard}>
                                    <div className={styles.selectedHeader}>
                                        <div>
                                            <div
                                                className={
                                                    styles.selectedLabel
                                                }
                                            >
                                                Selected Document
                                            </div>
                                            <div
                                                className={
                                                    styles.selectedTitle
                                                }
                                            >
                                                {selectedDoc.title}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={styles.inputGrid}>
                                <label className={styles.label}>
                                    Version
                                    <input
                                        className={styles.input}
                                        type="text"
                                        placeholder="e.g., v1.1, v2.0"
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
                                    !selectedDocId ||
                                    !version.trim()
                                }
                            >
                                {loading
                                    ? 'Uploading...'
                                    : '📤 Upload New Version'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UpdatePage;
