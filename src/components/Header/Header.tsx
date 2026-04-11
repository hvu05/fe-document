import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API_CONFIG from '../../config/api';
import styles from './Header.module.css';

const Header = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const userStr = localStorage.getItem(API_CONFIG.storageKeys.user);
    const user = userStr ? JSON.parse(userStr) : null;
    const username = user?.username ?? 'User';
    const email = user?.email ?? '';
    const initials = username.slice(0, 2).toUpperCase();

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem(API_CONFIG.storageKeys.accessToken);
        localStorage.removeItem(API_CONFIG.storageKeys.user);
        navigate('/login');
    };

    const isActive = (path: string) =>
        location.pathname === path
            ? `${styles.navBtn} ${styles.navBtnActive}`
            : styles.navBtn;

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logoSection}>
                <span className={styles.logoIcon}>📄</span>
                <span className={styles.logoText}>DocManager</span>
            </Link>

            <nav className={styles.nav}>
                <Link to="/search" className={isActive('/search')}>
                    <span className={styles.navIcon}>🔍</span>
                    Search
                </Link>
                <Link to="/my-documents" className={isActive('/my-documents')}>
                    <span className={styles.navIcon}>📁</span>
                    My Documents
                </Link>
                <Link to="/upload" className={isActive('/upload')}>
                    <span className={styles.navIcon}>⬆️</span>
                    Upload
                </Link>
            </nav>

            <div className={styles.userSection} ref={dropdownRef}>
                <button
                    className={styles.userBtn}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <div className={styles.userAvatar}>{initials}</div>
                    <span className={styles.userName}>{username}</span>
                    <span
                        className={`${styles.dropdownArrow} ${dropdownOpen ? styles.dropdownArrowOpen : ''}`}
                    >
                        ▼
                    </span>
                </button>

                {dropdownOpen && (
                    <div className={styles.dropdown}>
                        <div className={styles.dropdownHeader}>
                            <div className={styles.dropdownName}>
                                {username}
                            </div>
                            {email && (
                                <div className={styles.dropdownEmail}>
                                    {email}
                                </div>
                            )}
                        </div>
                        <Link
                            to="/profile"
                            className={styles.dropdownItem}
                            onClick={() => setDropdownOpen(false)}
                        >
                            <span className={styles.dropdownItemIcon}>👤</span>
                            Profile
                        </Link>
                        <div className={styles.dropdownDivider} />
                        <button
                            className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                            onClick={handleLogout}
                        >
                            <span className={styles.dropdownItemIcon}>🚪</span>
                            Log out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
