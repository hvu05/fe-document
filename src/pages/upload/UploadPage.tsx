/** @format */

import { useRef, useState, useEffect } from 'react';
import type { UploadedDocument } from '../../types/document';
import documentService from '../../services/documentService';
import styles from './UploadPage.module.css';

const DOCUMENT_TYPES = ['Contract', 'Report', 'Invoice', 'Other'];

type UploadMode = 'new' | 'version';

function isTextPreviewable(file: File): boolean {
    return (
        file.type.startsWith('text/') ||
        ['application/json', 'application/xml'].includes(file.type) ||
        /\.(txt|md|json|csv|log)$/i.test(file.name)
    );
}

const UploadPage = () => {
    const [documents, setDocuments] = useState<UploadedDocument[]>(MOCK_DOCUMENTS); // In reality, we fetch via useEffect
    const [title, setTitle] = useState('');
    const [type, setType] = useState(DOCUMENT_TYPES[0]);
    const [departmentId, setDepartmentId] = useState('');

    // New version fields
    const [myDocuments, setMyDocuments] = useState<Document[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [loadingDocs, setLoadingDocs] = useState(false);

    // Shared
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


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
        setUploading(true);

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

    const resetMessages = () => {
        setError('');
        setSuccess('');
    };

    const switchMode = (newMode: UploadMode) => {
        setMode(newMode);
        setSelectedFile(null);
        setSelectedDocId(null);
        setError('');
        setSuccess('');
        if (fileInputRef.current) fileInputRef.current.value = '';
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

                <div className={styles.formShell}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${mode === 'new' ? styles.tabActive : ''}`}
                            onClick={() => switchMode('new')}
                        >
                            📄 New Document
                        </button>
                        <button
                            className={`${styles.tab} ${mode === 'version' ? styles.tabActive : ''}`}
                            onClick={() => switchMode('version')}
                        >
                            📤 New Version
                        </button>
                    </div>

                    <div className={styles.formCard}>
                        <div className={styles.formHeader}>
                            <div>
                                <h2 className={styles.formTitle}>
                                    {mode === 'new'
                                        ? 'Create a New Document'
                                        : 'Upload a New Version for an Existing Document'}
                                </h2>
                                <p className={styles.formSubtitle}>
                                    {mode === 'new'
                                        ? 'The system will create the document and its first version after upload.'
                                        : 'Select the correct target document and the system will calculate the next version number.'}
                                </p>
                            </div>
                            <div className={styles.formBadge}>
                                {mode === 'new'
                                    ? 'Insert + version 1'
                                    : 'Append next version'}
                            </div>
                        </div>

                        <div className={styles.form}>
                            {mode === 'new' ? (
                                <>
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
                                            Department ID
                                            <input
                                                className={styles.input}
                                                type="number"
                                                min="1"
                                                placeholder="Example: 1"
                                                value={departmentId}
                                                onChange={(e) => {
                                                    setDepartmentId(
                                                        e.target.value
                                                    );
                                                    resetMessages();
                                                }}
                                            />
                                        </label>

                                        <div className={styles.infoPanel}>
                                            <div className={styles.infoLabel}>
                                                Database mapping
                                            </div>
                                            <div className={styles.infoText}>
                                                `documents.title`,
                                                `documents.type`, and
                                                `documents.department_id` are
                                                created together with
                                                `document_versions.version_number
                                                = 1`.
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <label className={styles.label}>
                                        Select an Existing Document
                                    </label>
                                    {loadingDocs ? (
                                        <div className={styles.loading}>
                                            Loading document list...
                                        </div>
                                    ) : myDocuments.length === 0 ? (
                                        <div className={styles.loading}>
                                            You do not have any documents yet.{' '}
                                            <button
                                                className={styles.tab}
                                                onClick={() =>
                                                    switchMode('new')
                                                }
                                            >
                                                Upload a New Document
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.docSelector}>
                                            {myDocuments.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className={`${styles.docOption} ${selectedDocId === doc.id ? styles.docOptionSelected : ''}`}
                                                    onClick={() => {
                                                        setSelectedDocId(
                                                            doc.id
                                                        );
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
                                                            {doc.type} •
                                                            Current: v
                                                            {doc.latestVersion
                                                                ?.versionNumber ??
                                                                doc
                                                                    .versions?.[0]
                                                                    ?.versionNumber ??
                                                                1}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={
                                                            styles.docOptionVersion
                                                        }
                                                    >
                                                        → v{getNextVersion(doc)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {selectedDoc && (
                                        <div
                                            className={
                                                styles.selectedDocumentCard
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.selectedHeader
                                                }
                                            >
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
                                                <div
                                                    className={
                                                        styles.versionInfo
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
                                        </div>
                                    )}
                                </>
                            )}

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
                                        if (file) {
                                            setPreviewFile(file);
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
                                onClick={handleSubmit}
                                disabled={
                                    uploading ||
                                    !selectedFile ||
                                    (mode === 'new' && !title.trim()) ||
                                    (mode === 'version' && !selectedDocId)
                                }
                            >
                                {uploading
                                    ? 'Uploading...'
                                    : mode === 'new'
                                      ? '⬆️ Upload New Document'
                                      : '📤 Upload New Version'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
