import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { username, password });
    // navigate('/documents');
  };

  return (
    <div className="login-page">
      <div className="panel-container login-card">
        
        <div className="login-header">
          <h1>Document Management System</h1>
          <p>Login to access your documents</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <input 
              id="username"
              type="text" 
              className="input-field" 
              placeholder="get@dept.gov"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary">
            Log in
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;
