/** @format */

import { useEffect, useRef, useState } from 'react';
import departmentService from '../../services/departmentService';
import documentService from '../../services/documentService';
import type { Department, Document } from '../../types/document';
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

function formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const UploadPage = () => {
    const [mode, setMode] = useState<UploadMode>('new');
    const [title, setTitle] = useState('');
    const [type, setType] = useState(DOCUMENT_TYPES[0]);
    const [departmentId, setDepartmentId] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [myDocuments, setMyDocuments] = useState<Document[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewText, setPreviewText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!previewFile) {
            setPreviewUrl('');
            setPreviewText('');
            return;
        }

        if (isTextPreviewable(previewFile)) {
            const reader = new FileReader();
            reader.onload = () => {
                const result =
                    typeof reader.result === 'string' ? reader.result : '';
                setPreviewText(result.slice(0, 5000));
            };
            reader.readAsText(previewFile);
            setPreviewUrl('');
            return;
        }

        const objectUrl = URL.createObjectURL(previewFile);
        setPreviewUrl(objectUrl);
        setPreviewText('');

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [previewFile]);

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const response = await departmentService.getDepartments();
                setDepartments(response.data);
            } catch {
                setDepartments([]);
            } finally {
                setLoadingDepartments(false);
            }
        };

        void loadDepartments();
    }, []);

    useEffect(() => {
        if (mode !== 'version') return;

        const loadMyDocuments = async () => {
            try {
                setLoadingDocs(true);
                const response = await documentService.getMyDocuments();
                setMyDocuments(response.data);
            } catch {
                setMyDocuments([]);
            } finally {
                setLoadingDocs(false);
            }
        };

        void loadMyDocuments();
    }, [mode]);

    const selectedDoc = myDocuments.find((doc) => doc.id === selectedDocId) ?? null;
    const previewKind = !previewFile
        ? 'empty'
        : previewFile.type.startsWith('image/')
          ? 'image'
          : previewFile.type === 'application/pdf'
            ? 'pdf'
            : isTextPreviewable(previewFile)
              ? 'text'
              : 'file';

    const resetMessages = () => {
        setError('');
        setSuccess('');
    };

    const resetForm = () => {
        setTitle('');
        setType(DOCUMENT_TYPES[0]);
        setDepartmentId('');
        setSelectedFile(null);
        setPreviewFile(null);
        setSelectedDocId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const switchMode = (nextMode: UploadMode) => {
        setMode(nextMode);
        resetMessages();
        resetForm();
    };

    const getNextVersion = (doc: Document): number => {
        if (!doc.versions || doc.versions.length === 0) return 1;
        return Math.max(...doc.versions.map((version) => version.versionNumber)) + 1;
    };

    const handleUploadNew = async () => {
        if (!title.trim()) {
            setError('Please enter a document title.');
            return;
        }
        if (!departmentId || Number(departmentId) <= 0) {
            setError('Please select a department.');
            return;
        }
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        try {
            setUploading(true);
            resetMessages();
            await documentService.uploadNewDocument({
                title: title.trim(),
                type,
                departmentId: Number(departmentId),
                file: selectedFile,
            });
            setSuccess('Document uploaded successfully.');
            resetForm();
        } catch {
            setError('Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    const handleUploadVersion = async () => {
        if (!selectedDocId) {
            setError('Please choose a document to upload a new version for.');
            return;
        }
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        try {
            setUploading(true);
            resetMessages();
            await documentService.uploadNewVersion(selectedDocId, selectedFile);
            setSuccess('New version uploaded successfully.');
            const response = await documentService.getMyDocuments();
            setMyDocuments(response.data);
            resetForm();
        } catch {
            setError('Failed to upload new version.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (mode === 'new') {
            await handleUploadNew();
            return;
        }

        await handleUploadVersion();
    };

    const renderPreview = () => {
        if (!previewFile) {
            return (
                <div className={styles.previewPlaceholder}>
                    <span className={styles.previewIcon}>🗂</span>
                    <div className={styles.previewFileName}>No file selected</div>
                    <div className={styles.previewHint}>
                        Choose a file to preview it before uploading.
                    </div>
                </div>
            );
        }

        if (previewKind === 'image' && previewUrl) {
            return (
                <img
                    src={previewUrl}
                    alt={previewFile.name}
                    className={styles.previewImage}
                />
            );
        }

        if (previewKind === 'pdf' && previewUrl) {
            return (
                <iframe
                    src={previewUrl}
                    title={previewFile.name}
                    className={styles.previewEmbed}
                />
            );
        }

        if (previewKind === 'text') {
            return <pre className={styles.previewText}>{previewText}</pre>;
        }

        return (
            <div className={styles.previewPlaceholder}>
                <span className={styles.previewIcon}>📄</span>
                <div className={styles.previewFileName}>{previewFile.name}</div>
                <div className={styles.previewHint}>
                    This file type cannot be previewed inline, but it is ready to upload.
                </div>
            </div>
        );
    };

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <section className={styles.heroCopy}>
                    <div className={styles.previewPanel}>
                        <div className={styles.previewHeader}>
                            <div>
                                <div className={styles.previewEyebrow}>Preview</div>
                                <h1 className={styles.previewTitle}>
                                    {mode === 'new'
                                        ? 'Prepare a new document upload'
                                        : 'Prepare a new document version'}
                                </h1>
                            </div>
                            <div className={styles.previewBadge}>
                                {previewKind === 'empty'
                                    ? 'Waiting'
                                    : previewKind.toUpperCase()}
                            </div>
                        </div>

                        <div className={styles.previewFrame}>{renderPreview()}</div>

                        <div className={styles.previewMetaBar}>
                            <span>
                                File: {previewFile?.name ?? 'No file selected'}
                            </span>
                            <span>
                                Size: {previewFile ? formatFileSize(previewFile.size) : '0 B'}
                            </span>
                        </div>
                    </div>
                </section>

                <section className={styles.formShell}>
                    <div className={styles.tabs}>
                        <button
                            type="button"
                            className={`${styles.tab} ${mode === 'new' ? styles.tabActive : ''}`}
                            onClick={() => switchMode('new')}
                        >
                            📄 New Document
                        </button>
                        <button
                            type="button"
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
                                        : 'Upload a New Version'}
                                </h2>
                                <p className={styles.formSubtitle}>
                                    {mode === 'new'
                                        ? 'Add document metadata, pick a file, and upload the first version.'
                                        : 'Select an existing document and the next version number will be inferred automatically.'}
                                </p>
                            </div>
                            <div className={styles.formBadge}>
                                {mode === 'new' ? 'Version 1' : 'Next version'}
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
                                                onChange={(event) => {
                                                    setTitle(event.target.value);
                                                    resetMessages();
                                                }}
                                            />
                                        </label>

                                        <label className={styles.label}>
                                            Document Type
                                            <select
                                                className={styles.select}
                                                value={type}
                                                onChange={(event) => {
                                                    setType(event.target.value);
                                                    resetMessages();
                                                }}
                                            >
                                                {DOCUMENT_TYPES.map((documentType) => (
                                                    <option key={documentType} value={documentType}>
                                                        {documentType}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div className={styles.inputGrid}>
                                        <label className={`${styles.label} ${styles.fullWidth}`}>
                                            Department
                                            <select
                                                className={styles.select}
                                                value={departmentId}
                                                onChange={(event) => {
                                                    setDepartmentId(event.target.value);
                                                    resetMessages();
                                                }}
                                                disabled={loadingDepartments}
                                            >
                                                <option value="">
                                                    {loadingDepartments
                                                        ? 'Loading departments...'
                                                        : departments.length > 0
                                                          ? 'Select a department'
                                                          : 'No departments available'}
                                                </option>
                                                {departments.map((department) => (
                                                    <option key={department.id} value={department.id}>
                                                        {department.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <label className={styles.label}>
                                        Select an Existing Document
                                    </label>

                                    {loadingDocs ? (
                                        <div className={styles.loading}>Loading document list...</div>
                                    ) : myDocuments.length === 0 ? (
                                        <div className={styles.loading}>
                                            You do not have any documents yet.
                                        </div>
                                    ) : (
                                        <div className={styles.docSelector}>
                                            {myDocuments.map((doc) => (
                                                <button
                                                    type="button"
                                                    key={doc.id}
                                                    className={`${styles.docOption} ${selectedDocId === doc.id ? styles.docOptionSelected : ''}`}
                                                    onClick={() => {
                                                        setSelectedDocId(doc.id);
                                                        resetMessages();
                                                    }}
                                                >
                                                    <div className={styles.docOptionInfo}>
                                                        <span className={styles.docOptionTitle}>{doc.title}</span>
                                                        <span className={styles.docOptionMeta}>
                                                            {doc.type} • Current: v
                                                            {doc.latestVersion?.versionNumber ?? doc.versions?.[0]?.versionNumber ?? 1}
                                                        </span>
                                                    </div>
                                                    <span className={styles.docOptionVersion}>
                                                        → v{getNextVersion(doc)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {selectedDoc && (
                                        <div className={styles.selectedDocumentCard}>
                                            <div className={styles.selectedHeader}>
                                                <div>
                                                    <div className={styles.selectedLabel}>Selected Document</div>
                                                    <div className={styles.selectedTitle}>{selectedDoc.title}</div>
                                                </div>
                                                <div className={styles.versionInfo}>
                                                    <span className={styles.versionInfoIcon}>📌</span>
                                                    Next version: v{getNextVersion(selectedDoc)}
                                                </div>
                                            </div>

                                            <div className={styles.metaGrid}>
                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaKey}>Type</span>
                                                    <span className={styles.metaValue}>{selectedDoc.type}</span>
                                                </div>
                                                <div className={styles.metaItem}>
                                                    <span className={styles.metaKey}>Current Version</span>
                                                    <span className={styles.metaValue}>
                                                        v{selectedDoc.latestVersion?.versionNumber ?? selectedDoc.versions?.[0]?.versionNumber ?? 1}
                                                    </span>
                                                </div>
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
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] ?? null;
                                        setSelectedFile(file);
                                        setPreviewFile(file);
                                        resetMessages();
                                    }}
                                />
                            </label>

                            {error && <p className={styles.errorMsg}>{error}</p>}
                            {success && <p className={styles.successMsg}>{success}</p>}

                            <button
                                type="button"
                                className={styles.uploadBtn}
                                onClick={() => void handleSubmit()}
                                disabled={
                                    uploading ||
                                    !selectedFile ||
                                    (mode === 'new' && (!title.trim() || !departmentId)) ||
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
                </section>
            </div>
        </div>
    );
};

export default UploadPage;
