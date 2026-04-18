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
    const [departmentName, setDepartmentName] = useState<string>('Loading...');

    useEffect(() => {
        const localUser = localStorage.getItem(API_CONFIG.storageKeys.user);
        if (localUser) {
            try {
                setProfile(JSON.parse(localUser) as UserProfile);
            } catch {
                localStorage.removeItem(API_CONFIG.storageKeys.user);
            }
        }

        const fetchData = async () => {
            try {
                const profileRes = await authService.getProfile();
                const fetchedProfile = (profileRes.data as any).data || profileRes.data;
                setProfile(fetchedProfile);
                localStorage.setItem(
                    API_CONFIG.storageKeys.user,
                    JSON.stringify(fetchedProfile)
                );

                const dId = fetchedProfile?.departmentId;
                if (dId !== undefined && dId !== null) {
                    const deptsRes = await authService.getDepartments();
                    const depts = (deptsRes.data as any).data || deptsRes.data || [];
                    const matched = depts.find((d: any) => d.id === Number(dId));
                    if (matched) {
                        setDepartmentName(matched.name);
                    } else {
                        setDepartmentName(`Unknown (ID: ${dId})`);
                    }
                } else {
                    setDepartmentName('—');
                }
            } catch (err) {
                setError('Failed to load profile data from the backend.');
                setDepartmentName('—');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fullName = useMemo(() => {
        if (!profile) return 'User';
        const parts = [profile.firstName, profile.lastName].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : profile.username || 'User';
    }, [profile]);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div>
                    <div className={styles.eyebrow}>Account</div>
                    <h1 className={styles.title}>Profile</h1>
                    <p className={styles.subtitle}>
                        View your personal account information and system roles.
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
                            {profile?.roles?.[0]?.roleName || 'No role provided'}
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
                                GET /v1/users/me
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
                                    First Name
                                </span>
                                <span className={styles.detailValue}>
                                    {profile?.firstName || '—'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>
                                    Last Name
                                </span>
                                <span className={styles.detailValue}>
                                    {profile?.lastName || '—'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Roles</span>
                                <span className={styles.detailValue}>
                                    {profile?.roles?.map(r => r.roleName).join(', ') || '—'}
                                </span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>
                                    Department
                                </span>
                                <span className={styles.detailValue}>
                                    {departmentName}
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
