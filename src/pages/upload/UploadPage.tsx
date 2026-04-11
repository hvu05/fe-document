/** @format */

import { useRef, useState, useEffect } from 'react';
import departmentService from '../../services/departmentService.ts';
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

const UploadPage = () => {
    const [mode, setMode] = useState<UploadMode>('new');

    // New document fields
    const [title, setTitle] = useState('');
    const [type, setType] = useState(DOCUMENT_TYPES[0]);
    const [departmentId, setDepartmentId] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    // New version fields
    const [myDocuments, setMyDocuments] = useState<Document[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [loadingDocs, setLoadingDocs] = useState(false);

    // Shared
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [previewText, setPreviewText] = useState('');
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

        loadDepartments();
    }, []);

    // Fetch the user's documents when switching to version mode.
    useEffect(() => {
        if (mode === 'version') {
            setLoadingDocs(true);
            documentService
                .getMyDocuments()
                .then((res) => setMyDocuments(res.data))
                .catch(() => setMyDocuments([]))
                .finally(() => setLoadingDocs(false));
        }
    }, [mode]);

    const getNextVersion = (doc: Document): number => {
        if (!doc.versions || doc.versions.length === 0) return 1;
        return Math.max(...doc.versions.map((v) => v.versionNumber)) + 1;
    };

    const selectedDoc = myDocuments.find((d) => d.id === selectedDocId) ?? null;
    const previewKind = !previewFile
        ? 'empty'
        : previewFile.type.startsWith('image/')
          ? 'image'
          : previewFile.type === 'application/pdf'
            ? 'pdf'
            : isTextPreviewable(previewFile)
              ? 'text'
              : 'file';

    const handleUploadNew = async () => {
        if (!title.trim()) {
            setError('Please enter a document title.');
            return;
        }
        if (!departmentId.trim() || Number(departmentId) <= 0) {
            setError('Please select a department.');
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
            await documentService.uploadNewDocument({
                title: title.trim(),
                type,
                departmentId: Number(departmentId),
                file: selectedFile,
            });
            setSuccess(
                'Document uploaded successfully. Version 1 was created automatically.'
            );
            setTitle('');
            setType(DOCUMENT_TYPES[0]);
            setDepartmentId('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleUploadVersion = async () => {
        if (!selectedDocId) {
            setError('Please select a document for the new version upload.');
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
            const nextVer = selectedDoc ? getNextVersion(selectedDoc) : '?';
            await documentService.uploadNewVersion(selectedDocId, selectedFile);
            setSuccess(
                `Version ${nextVer} uploaded successfully for "${selectedDoc?.title}".`
            );
            setSelectedDocId(null);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            // Refresh the document list.
            const res = await documentService.getMyDocuments();
            setMyDocuments(res.data);
        } catch {
            setError('New version upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = () => {
        if (mode === 'new') handleUploadNew();
        else handleUploadVersion();
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
            <div className={styles.hero}>
                <div className={styles.heroCopy}>
                    <div className={styles.previewPanel}>
                        <div className={styles.previewHeader}>
                            <div>
                                <div className={styles.previewEyebrow}>
                                    Live Preview
                                </div>
                                <h2 className={styles.previewTitle}>
                                    Uploaded Document Viewer
                                </h2>
                            </div>
                            {previewFile && (
                                <span className={styles.previewBadge}>
                                    {previewKind.toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className={styles.previewFrame}>
                            {previewKind === 'image' && previewUrl && (
                                <img
                                    className={styles.previewImage}
                                    src={previewUrl}
                                    alt={previewFile?.name ?? 'Preview'}
                                />
                            )}

                            {previewKind === 'pdf' && previewUrl && (
                                <iframe
                                    className={styles.previewEmbed}
                                    src={previewUrl}
                                    title={previewFile?.name ?? 'PDF preview'}
                                />
                            )}

                            {previewKind === 'text' && (
                                <pre className={styles.previewText}>
                                    {previewText}
                                </pre>
                            )}

                            {previewKind === 'file' && previewFile && (
                                <div className={styles.previewPlaceholder}>
                                    <div className={styles.previewIcon}>📄</div>
                                    <div className={styles.previewFileName}>
                                        {previewFile.name}
                                    </div>
                                    <div className={styles.previewHint}>
                                        Browser preview is not available for
                                        this file type, but the selected file is
                                        ready to upload.
                                    </div>
                                </div>
                            )}

                            {previewKind === 'empty' && (
                                <div className={styles.previewPlaceholder}>
                                    <div className={styles.previewIcon}>🗂</div>
                                    <div className={styles.previewFileName}>
                                        No file selected yet
                                    </div>
                                    <div className={styles.previewHint}>
                                        Choose a file on the right to preview
                                        the uploaded document here.
                                    </div>
                                </div>
                            )}
                        </div>

                        {previewFile && (
                            <div className={styles.previewMetaBar}>
                                <span>{previewFile.name}</span>
                                <span>
                                    {(previewFile.size / 1024 / 1024).toFixed(
                                        2
                                    )}{' '}
                                    MB
                                </span>
                            </div>
                        )}
                    </div>
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
                                        <label
                                            className={`${styles.label} ${styles.fullWidth}`}
                                        >
                                            Department
                                            <select
                                                className={styles.select}
                                                value={departmentId}
                                                onChange={(e) => {
                                                    setDepartmentId(
                                                        e.target.value
                                                    );
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
                                                {departments.map(
                                                    (department) => (
                                                        <option
                                                            key={department.id}
                                                            value={
                                                                department.id
                                                            }
                                                        >
                                                            {department.name}
                                                        </option>
                                                    )
                                                )}
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
                                                >
                                                    <span
                                                        className={
                                                            styles.versionInfoIcon
                                                        }
                                                    >
                                                        ℹ️
                                                    </span>
                                                    New version: v
                                                    {getNextVersion(
                                                        selectedDoc
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.metaGrid}>
                                                <div
                                                    className={styles.metaItem}
                                                >
                                                    <span
                                                        className={
                                                            styles.metaKey
                                                        }
                                                    >
                                                        Document ID
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.metaValue
                                                        }
                                                    >
                                                        {selectedDoc.id}
                                                    </span>
                                                </div>
                                                <div
                                                    className={styles.metaItem}
                                                >
                                                    <span
                                                        className={
                                                            styles.metaKey
                                                        }
                                                    >
                                                        Department ID
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.metaValue
                                                        }
                                                    >
                                                        {
                                                            selectedDoc.departmentId
                                                        }
                                                    </span>
                                                </div>
                                                <div
                                                    className={styles.metaItem}
                                                >
                                                    <span
                                                        className={
                                                            styles.metaKey
                                                        }
                                                    >
                                                        Type
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.metaValue
                                                        }
                                                    >
                                                        {selectedDoc.type ||
                                                            'Other'}
                                                    </span>
                                                </div>
                                                <div
                                                    className={styles.metaItem}
                                                >
                                                    <span
                                                        className={
                                                            styles.metaKey
                                                        }
                                                    >
                                                        Current Version
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.metaValue
                                                        }
                                                    >
                                                        v
                                                        {selectedDoc
                                                            .latestVersion
                                                            ?.versionNumber ??
                                                            selectedDoc
                                                                .versions?.[0]
                                                                ?.versionNumber ??
                                                            1}
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
