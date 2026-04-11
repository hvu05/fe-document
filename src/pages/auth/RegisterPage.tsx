import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import type { Department } from '../../services/authService';

import './AuthPage.css';

const RegisterPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        departmentId: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            // try {
            //     const response = await authService.getDepartments();
            //     if (response.data && response.data.code === 200) {
            //         setDepartments(response.data.data);
            //     }
            // } catch (err) {
            //     console.error('Failed to fetch departments', err);
            // }
            const department =  [
            {
                id: 1,
                name: "department 1"
            },
            {
                id: 2,
                name: "department 2"
            }
        ]
        setDepartments(department)
        };
        fetchDepartments();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate
        if (!formData.firstName || !formData.username || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            setLoading(true);
            const response = await authService.register(formData);
            if (response.data && response.data.code === 200) {
                setSuccess('Registration successful! Redirecting...');
                // setTimeout(() => navigate('/login'), 2000);
            } else {
                    setError(response.data?.message || 'Registration failed.');
            }
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
                        <label htmlFor="firstName">First name *</label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={handleChange}
                            autoComplete="given-name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last name *</label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={handleChange}
                            autoComplete="family-name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="departmentId">Phòng ban</label>
                        <select
                            id="departmentId"
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                border: '1px solid #ddd', 
                                borderRadius: '4px', 
                                marginTop: '5px' 
                            }}
                        >
                            <option value={0}>-- Chọn phòng ban --</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">username *</label>
                        <input
                            id="username"
                            name="username"
                            type="username"
                            placeholder="User name"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password at least 6 characters"
                            value={formData.password}
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
