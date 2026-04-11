import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './AuthPage.css';

const RegisterPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate
        if (!formData.username || !formData.email || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            const { confirmPassword, ...payload } = formData;
            void confirmPassword; // avoid unused warning
            await authService.register(payload);
            setSuccess('Registration successful! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as {
                    response?: { data?: { message?: string } };
                };
                setError(
                    axiosErr.response?.data?.message || 'Registration failed.'
                );
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Document Management System</h1>
                    <p>Register to access your documents</p>
                </div>

                {error && (
                    <div className="auth-alert auth-alert-error">{error}</div>
                )}
                {success && (
                    <div className="auth-alert auth-alert-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username *</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Enter phone number (optional)"
                            value={formData.phone}
                            onChange={handleChange}
                            autoComplete="tel"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm Password *
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="auth-options">
                        <label className="remember-me">
                            <input type="checkbox" /> Remember me
                        </label>
                        <Link to="/login" className="login-link">
                            Login instead?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
