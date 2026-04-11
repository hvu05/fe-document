import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-container">
            <nav className="home-nav">
                <div className="logo">DocuFlow</div>
                <div className="nav-links">
                    <Link to="/login" className="nav-btn-outline">Sign In</Link>
                    <Link to="/register" className="nav-btn-solid">Get Started</Link>
                </div>
            </nav>

            <main className="home-main">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Manage Your Documents<br />
                        <span className="text-gradient">With Intelligent Ease</span>
                    </h1>
                    <p className="hero-subtitle">
                        DocuFlow is the ultimate Document Management System. Securely upload, organize, and collaborate on your files from anywhere, at any time.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn-primary-large">Start for Free</Link>
                        <Link to="/upload" className="btn-secondary-large">Quick Upload</Link>
                    </div>
                </div>

                <div className="features-section">
                    <div className="feature-card">
                        <div className="feature-icon">📁</div>
                        <h3>Smart Organization</h3>
                        <p>Keep your department's files neatly categorized and easily accessible.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Bank-Grade Security</h3>
                        <p>Your documents are encrypted and protected with enterprise-level security.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Lightning Fast</h3>
                        <p>Experience zero-latency uploads and instant access to your records.</p>
                    </div>
                </div>
            </main>
            
            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} DocuFlow DMS. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
