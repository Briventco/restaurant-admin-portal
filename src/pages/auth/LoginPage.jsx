import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { DEFAULT_ROUTE_BY_ROLE, ROLE_LABELS, ROLES } from '../../auth/roleConfig';
import './Login.css';

const roleOptions = [ROLES.SUPER_ADMIN, ROLES.RESTAURANT_ADMIN, ROLES.RESTAURANT_STAFF];

const demoAccountByRole = {
  [ROLES.SUPER_ADMIN]: { email: 'super@brivent.com', password: 'admin123' },
  [ROLES.RESTAURANT_ADMIN]: { email: 'owner@demo.com', password: 'admin123' },
  [ROLES.RESTAURANT_STAFF]: { email: 'staff@demo.com', password: 'admin123' },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('super@brivent.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState(ROLES.SUPER_ADMIN);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login({ email, password, role });

    if (!result.success) {
      setError(result.message || 'Login failed.');
      setIsSubmitting(false);
      return;
    }

    const nextPath = DEFAULT_ROUTE_BY_ROLE[result.user.role] || '/dashboard';
    navigate(nextPath, { replace: true });
  };

  const loginAsDemo = async (selectedRole) => {
    const demo = demoAccountByRole[selectedRole];
    setEmail(demo.email);
    setPassword(demo.password);
    setRole(selectedRole);
    setError('');

    setIsSubmitting(true);
    const result = await login({ email: demo.email, password: demo.password, role: selectedRole });
    if (result.success) {
      navigate(DEFAULT_ROUTE_BY_ROLE[result.user.role] || '/dashboard', { replace: true });
    } else {
      setError(result.message || 'Login failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <h1>Restaurant Admin Portal</h1>
        <p className="muted-text">Single app with role-based access for Brivent and restaurant teams.</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label htmlFor="login-email" className="input-label">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="input-label">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-role" className="input-label">Role (MVP mock)</label>
            <select
              id="login-role"
              className="input"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {roleOptions.map((roleOption, index) => (
                <option key={`role-${roleOption}-${index}`} value={roleOption}>
                  {ROLE_LABELS[roleOption]}
                </option>
              ))}
            </select>
          </div>

          <button className="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-login-grid">
          {roleOptions.map((roleOption, index) => (
            <button
              type="button"
              key={`demo-${roleOption}-${index}`}
              className="button button-ghost"
              onClick={() => loginAsDemo(roleOption)}
              disabled={isSubmitting}
            >
              Use {ROLE_LABELS[roleOption]} Demo
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;