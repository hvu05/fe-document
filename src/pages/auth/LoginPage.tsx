import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import type { LoginPayload } from '../../services/authService';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!identifier || !password) {
            setError('Please enter your email/username and password');
            return;
        }

        try {
            setLoading(true);
            const payload: LoginPayload = { identifier, password };
            const response = await authService.login(payload);
            
            // Lấy token và lưu
            const { access_token } = response.data;
            if (access_token) {
                localStorage.setItem('access_token', access_token);
                // Redirect user sau khi login thành công
                navigate('/upload');
            }
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

                <form className="login-form" onSubmit={handleLogin}>
                    {error && <div style={{color: '#dc2626', marginBottom: '10px', fontSize: '0.9rem'}}>{error}</div>}
                    
                    <div className="form-group">
                        <input
                            id="identifier"
                            type="text"
                            className="input-field"
                            placeholder="Email, Username, or Phone"
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

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
