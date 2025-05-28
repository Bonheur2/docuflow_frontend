import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const basicAuth = 'Basic ' + btoa(`${username}:${password}`);
      
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        {},
        {
          headers: {
            'Authorization': basicAuth,
          },
          withCredentials: true,
        }
      );
      console.log(response); 

      
      if (response.status === 200) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        console.log("Navigating to dashboard...");
        navigate('/dashboard');
      }
      else if (response.status === 401) {
        setError('Invalid credentials. Please try again.');
      } else {
        setError(response.data); 
      }
    } catch (err) {
      console.error('Login error:', err.response); 
      const errorMessage = err.response?.data || 'Network issues.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login to DocuFlow</h2>
      {error && <div className="error-message">{error}</div>} 
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            disabled={isLoading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="auth-links">
        <p>Don't have an account? <Link to="/api/auth/signup">Sign up</Link></p>
      </div>
    </div>
  );
}

export default Login;