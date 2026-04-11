import { useEffect, useMemo, useState } from 'react';
import authService, { type UserProfile } from '../../services/authService';
import API_CONFIG from '../../config/api';
import styles from './ProfilePage.module.css';

function formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const localUser = localStorage.getItem(API_CONFIG.storageKeys.user);
        if (localUser) {
            try {
                setProfile(JSON.parse(localUser) as UserProfile);
            } catch {
                localStorage.removeItem(API_CONFIG.storageKeys.user);
            }
        }

        authService
            .getProfile()
            .then((response) => {
                setProfile(response.data);
                localStorage.setItem(
                    API_CONFIG.storageKeys.user,
                    JSON.stringify(response.data)
                );
            })
            .catch(() => {
                setError('Failed to load profile data from the backend.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const fullName = useMemo(() => {
        if (!profile) return 'User';
        const parts = [profile.first_name, profile.last_name].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : profile.username || 'User';
    }, [profile]);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div>
                    <div className={styles.eyebrow}>Account</div>
                    <h1 className={styles.title}>Profile</h1>
                    <p className={styles.subtitle}>
                        This page is already connected to the profile API. You
                        can now align the backend response shape with the
                        displayed fields below.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className={styles.stateCard}>Loading profile...</div>
            ) : error && !profile ? (
                <div className={styles.stateCardError}>{error}</div>
            ) : (
                <div className={styles.grid}>
                    <section className={styles.summaryCard}>
                        <div className={styles.avatar}>
                            {fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className={styles.summaryName}>{fullName}</div>
                        <div className={styles.summaryMeta}>
                            {profile?.role || 'No role provided'}
                        </div>
                        <div className={styles.summaryMeta}>
                            {profile?.email || 'No email provided'}
                        </div>
                        {error && (
                            <div className={styles.inlineError}>{error}</div>
                        )}
                    </section>

                    <section className={styles.detailsCard}>
                        <div className={styles.detailsHeader}>
                            <h2 className={styles.detailsTitle}>
                                Profile Details
                            </h2>
                            <span className={styles.apiBadge}>
                                GET /auth/profile
                            </span>
                        </div>

                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>
                                    Username
                                </span>
                                <span className={styles.detailValue}>
                                    {profile?.username || '—'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>
                                    Email
                                </span>
                                <span className={styles.detailValue}>
                                    {profile?.email || '—'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>
                                    First Name
                                </span>
                                <span className={styles.detailValue}>
                                    {profile?.first_name || '—'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>
                                    Last Name
                                </span>
                                <span className={styles.detailValue}>
                                    {profile?.last_name || '—'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Role</span>
                                <span className={styles.detailValue}>
                                    {profile?.role || '—'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>
                                    Department ID
                                </span>
                                <span className={styles.detailValue}>
                                    {profile?.departmentId ??
                                        profile?.department_id ??
                                        '—'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>
                                    Created At
                                </span>
                                <span className={styles.detailValue}>
                                    {formatDate(
                                        profile?.createdAt ||
                                            profile?.created_at
                                    )}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>
                                    Raw User ID
                                </span>
                                <span className={styles.detailValue}>
                                    {profile?.id || profile?._id || '—'}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
