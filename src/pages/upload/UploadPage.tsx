/** @format */

import { useRef, useState } from 'react';
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
    // Document list and its metadata
    const [documents, setDocuments] = useState<UploadedDocument[]>([]); //
    const [title, setTitle] = useState<string>('');
    const [type, setType] = useState(DOCUMENT_TYPES[0]);
    const [departmentId, setDepartmentId] = useState<string>('');
    const [version, setVersion] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // States to render document list
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);
    // Mockup state for loading
    const [loadingDocs, setLoadingDocs] = useState<boolean>(false);

    // Status
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [success, setSuccess] = useState<string>('');
    const [mode, setMode] = useState<UploadMode | null>("new");

    const handleUpload = async () => {
        if (!title.trim()) {
            setError('Please enter a document title.');
            return;
        }
        // if (!departmentId.trim() || Number(departmentId) <= 0) {
        //     setError('Please enter a valid department ID.');
        //     return;
        // }
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
            // API Connection
            // const res = await documentService.uploadDocument(
            //     selectedFile,
            //     title.trim(),
            //     type
            // );

            // Khi upload thành công (Giả lập response trả về document mới)
            // Trong thực tế sẽ setDocuments([res.data.document, ...documents])
            // Xử lý mock để UI được mượt
            const res: any = await new Promise(resolve => 
                setTimeout(() => {
                    resolve({
                        data: {
                            message: 'Upload successful',
                            document: null,
                        },
                    });
                }, 500)
            );

            let newDoc = res.data?.document;
            // File format
            if (!newDoc) {
                newDoc = {
                    id: `doc-${Date.now()}`,
                    title: title.trim(),
                    type,
                    fileName: selectedFile.name,
                    fileSize: selectedFile.size,
                    createdAt: new Date(),
                    fileUrl: URL.createObjectURL(selectedFile),
                    departmentId: departmentId,
                    createdBy: "Temp user",
                    versionHistory: [
                        {
                            version: version,
                            fileName: selectedFile.name,
                            fileSize: selectedFile.size,
                            createdAt: new Date(),
                            fileUrl: URL.createObjectURL(selectedFile),
                        },
                    ],
                };
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
            {/* ====== Right Panel: Document List ====== */}
            <main className={styles.rightPanel}>
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
{/* 
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
                                        </div> */}
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
                                    ) : documents.length === 0 ? (
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
                                            {documents.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className={`${styles.docOption} ${selectedDocId === doc.id ? styles.docOptionSelected : ''}`}
                                                    onClick={() => {
                                                        setSelectedDocId(
                                                            doc.id
                                                        );
                                                        //TODO: Implement selectedDoc here
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
                                                    //TODO: Get next version
                                                    {/* <span
                                                        className={
                                                            styles.docOptionVersion
                                                        }
                                                    >
                                                        {getNextVersion(doc)}
                                                    </span> */}
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
                                                <button
                                                    className={
                                                        styles.versionInfo
                                                    }
                                                    disabled={!selectedDoc.fileUrl}
                                                    title="Download"
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    className={styles.btnDelete}
                                                    onClick={() =>
                                                        handleDelete(selectedDoc.id)
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
                                        // TODO: Preview file
                                        // if (file) {
                                        //     setPreviewFile(file);
                                        // }
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
                                    (mode === 'new' && !title.trim()) ||
                                    (mode === 'version' && !selectedDocId)
                                }
                            >
                                {loading
                                    ? 'Uploading...'
                                    : mode === 'new'
                                      ? '⬆️ Upload New Document'
                                      : '📤 Upload New Version'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UploadPage;
