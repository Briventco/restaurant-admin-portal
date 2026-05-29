import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import './Waitlist.css';

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Waitlist = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    businessName: '',
    whatsappNumber: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.businessName.trim()) errors.businessName = 'Business name is required';
    if (!formData.whatsappNumber.trim()) errors.whatsappNumber = 'WhatsApp number is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        setFormData({ businessName: '', whatsappNumber: '', email: '' });
        setSubmitted(true);
      } else {
        const msg = String(data.message || 'Something went wrong. Please try again.');
        const lower = msg.toLowerCase();
        if (lower.includes('already') || lower.includes('duplicate') || lower.includes('exist')) {
          setApiError("Looks like you're already on our waitlist 👍");
        } else {
          setApiError(msg);
        }
      }
    } catch {
      setApiError('Something went wrong. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wl-app">
      <button
        className="wl-theme-btn"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="wl-container">
        <button onClick={() => navigate('/')} className="wl-back">
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        {!submitted ? (
          <motion.div
            className="wl-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="wl-title">Join the Waitlist</h1>
            <p className="wl-sub">
              Be the first to automate your restaurant orders with Servra.
            </p>

            <form onSubmit={handleSubmit} className="wl-form">
              <div className="wl-field">
                <label htmlFor="businessName">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  placeholder="e.g. Mama Put Kitchen"
                  value={formData.businessName}
                  onChange={handleChange}
                />
                {fieldErrors.businessName && (
                  <span className="wl-field-error">{fieldErrors.businessName}</span>
                )}
              </div>

              <div className="wl-field">
                <label htmlFor="whatsappNumber">WhatsApp Number</label>
                <input
                  type="tel"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  placeholder="e.g. 08012345678"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                />
                {fieldErrors.whatsappNumber && (
                  <span className="wl-field-error">{fieldErrors.whatsappNumber}</span>
                )}
              </div>

              <div className="wl-field">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && (
                  <span className="wl-field-error">{fieldErrors.email}</span>
                )}
              </div>

              {apiError && (
                <p className="wl-api-error">{apiError}</p>
              )}

              <button type="submit" className="wl-submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Joining...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Join Waitlist
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            className="wl-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="wl-success__emoji">🎉</div>
            <h2>You're on the list!</h2>
            <p>We'll reach out to you on WhatsApp soon. Keep an eye on your email too.</p>
            <button onClick={() => navigate('/')} className="wl-submit">
              Back to Home
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Waitlist;
