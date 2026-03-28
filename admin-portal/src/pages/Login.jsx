
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'login.css';

const Login = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('rememberedPassword') || '');
  const [rememberMe, setRememberMe] = useState(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    return Boolean(savedEmail && savedPassword);
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validCredentials = [
    { email: 'admin@brivent.com', password: 'admin123' },
    { email: 'guest@brivent.com', password: 'guest123' },
  ];

  const validateEmail = (inputEmail) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(inputEmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const matched = validCredentials.find((item) => {
      return item.email.toLowerCase() === normalizedEmail.toLowerCase() && item.password === password;
    });

    if (matched) {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', normalizedEmail);
        localStorage.setItem('rememberedPassword', password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      const sessionData = {
        email: normalizedEmail,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      localStorage.setItem('auth', 'true');
      localStorage.setItem('session', JSON.stringify(sessionData));
      localStorage.setItem('userEmail', normalizedEmail);

      setIsLoading(false);
      navigate('/', { replace: true });
    } else {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset link will be sent to your email');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <i className="fas fa-message"></i>
          <h1>Brivent Admin</h1>
          <p>Sign in to access the portal</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="login-helper">
          <p><strong>Use these credentials for demo login:</strong></p>
          <p>admin@brivent.com / admin123</p>
          <p>guest@brivent.com / guest123</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
            />
          </div>

          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
