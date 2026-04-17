import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import API_CONFIG from '../../config/api';
import type { LoginPayload } from '../../services/authService';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!identifier.trim() || !password.trim()) {
            setError('Please enter your email/username and password.');
            return;
        }

        try {
            setLoading(true);
            const response = await authService.login({
                identifier: identifier.trim(),
                password,
            });

            localStorage.setItem(
                API_CONFIG.storageKeys.accessToken,
                response.data.access_token
            );
            localStorage.setItem(
                API_CONFIG.storageKeys.user,
                JSON.stringify(response.data.user)
            );

            navigate('/');
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as {
                    response?: { data?: { message?: string } };
                };
                setError(axiosErr.response?.data?.message || 'Login failed.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="panel-container login-card">
                <div className="login-header">
                    <h1>Document Management System</h1>
                    <p>Login to access your documents</p>
                </div>

                {error && (
                    <div className="auth-alert auth-alert-error">{error}</div>
                )}

                <form className="login-form" onSubmit={handleLogin}>
                    {error && <div style={{ color: '#dc2626', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}

                    <div className="form-group">
                        <input
                            id="identifier"
                            type="text"
                            className="input-field"
                            placeholder="Email or username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            id="password"
                            type="password"
                            className="input-field"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#" className="forgot-password">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Log in'}
                    </button>

                    <span>
                        Don't have an account?   <Link to="/register" className="forgot-password">Sign in here</Link>
                    </span>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
