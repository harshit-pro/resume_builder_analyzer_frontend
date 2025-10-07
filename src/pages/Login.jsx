import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import http from '../api/httpClient';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await http.post(
        '/api/v1/resume/login',
        new URLSearchParams({
          email: formData.email,
          password: formData.password
        }),
        {
          headers: {

            'Content-Type': 'application/x-www-form-urlencoded'
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        // Store authentication state and remember me preference
        localStorage.setItem('isAuthenticated', 'true');
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <h2 style={styles.title}>Welcome Back</h2>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.passwordHeader}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.options}>
            <label style={styles.rememberMe}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={styles.checkbox}
              />
              Remember me
            </label>
            <Link to="/forgot-password" style={styles.forgotPassword}>Forgot password?</Link>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={isLoading ? styles.buttonLoading : styles.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span style={styles.spinner}></span>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>Don't have an account? <Link to="/signup" style={styles.footerLink}>Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif"
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    padding: '40px',
    textAlign: 'center'
  },
  logo: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '16px 0 0',
    lineHeight: '1.3'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    textAlign: 'left'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    color: '#1e293b',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#6366f1',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
  },
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  showPassword: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '0'
  },
  options: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px'
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    color: '#64748b',
    cursor: 'pointer'
  },
  checkbox: {
    marginRight: '8px',
    accentColor: '#6366f1'
  },
  forgotPassword: {
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '500'
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#6366f1',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px'
  },
  buttonLoading: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#a5b4fc',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s linear infinite'
  },
  error: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'left',
    marginBottom: '8px'
  },
  footer: {
    marginTop: '24px',
    fontSize: '14px',
    color: '#64748b'
  },
  footerText: {
    margin: '0'
  },
  footerLink: {
    color: '#6366f1',
    fontWeight: '500',
    textDecoration: 'none'
  }
};

export default Login;