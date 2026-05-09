import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import './Waitlist.css';

const Waitlist = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    whatsappNumber: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="wl-app">
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
                  required
                />
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
                  required
                />
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
                  required
                />
              </div>

              <button type="submit" className="wl-submit">
                <FontAwesomeIcon icon={faPaperPlane} />
                Join Waitlist
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
            <FontAwesomeIcon icon={faCheckCircle} className="wl-success__icon" />
            <h2>You're on the list!</h2>
            <p>We'll notify you when Servra launches. Get ready to automate your orders.</p>
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