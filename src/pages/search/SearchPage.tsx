import { useState } from 'react';
import documentService from '../../services/documentService';
import type { Document } from '../../types/document';
import styles from './SearchPage.module.css';

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

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Document[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        try {
            setLoading(true);
            const res = await documentService.searchDocuments(query.trim());
            setResults(res.data);
            setSearched(true);
        } catch {
            alert('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleDownload = async (doc: Document) => {
        const latest = doc.latestVersion ?? doc.versions?.[0];
        if (!latest) return;
        try {
            const res = await documentService.downloadVersion(
                doc.id,
                latest.id
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = latest.fileName || doc.title;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            alert('Download failed');
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.searchSection}>
                <h1 className={styles.searchTitle}>Search Documents</h1>
                <div className={styles.searchBar}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Enter document title, type, or keyword..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className={styles.searchBtn}
                        onClick={handleSearch}
                        disabled={!query.trim() || loading}
                    >
                        {loading ? 'Searching...' : '🔍 Search'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Searching...</div>
            ) : searched ? (
                results.length === 0 ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>🔍</span>
                        <span className={styles.emptyText}>
                            No matching documents found
                        </span>
                    </div>
                ) : (
                    <>
                        <div className={styles.resultHeader}>
                            <span className={styles.resultTitle}>
                                Search Results
                            </span>
                            <span className={styles.resultCount}>
                                {results.length} results
                            </span>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Version</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((doc) => {
                                        const latest =
                                            doc.latestVersion ??
                                            doc.versions?.[0];
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
                                                        className={
                                                            styles.versionBadge
                                                        }
                                                    >
                                                        v
                                                        {latest?.versionNumber ??
                                                            1}
                                                    </span>
                                                </td>
                                                <td>
                                                    {doc.createdAt
                                                        ? formatDate(
                                                              doc.createdAt
                                                          )
                                                        : '—'}
                                                </td>
                                                <td>
                                                    <div
                                                        className={
                                                            styles.actions
                                                        }
                                                    >
                                                        <button
                                                            className={
                                                                styles.btnView
                                                            }
                                                            title="View"
                                                        >
                                                            👁 View
                                                        </button>
                                                        <button
                                                            className={
                                                                styles.btnDownload
                                                            }
                                                            onClick={() =>
                                                                handleDownload(
                                                                    doc
                                                                )
                                                            }
                                                            title="Download"
                                                        >
                                                            ⬇ Download
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )
            ) : (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>📄</span>
                    <span className={styles.emptyText}>
                        Enter a keyword to search documents
                    </span>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
