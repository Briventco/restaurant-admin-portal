
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);

  const handleBriventAdmin = () => {
    navigate('/login/brivent-admin');
  };

  const handleRestaurantAdmin = () => {
    setShowRestaurantModal(false);
    navigate('/login/restaurant-admin');
  };

  const handleRestaurantStaff = () => {
    setShowRestaurantModal(false);
    navigate('/login/restaurant-staff');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-section">
          <div className="logo-container">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 3L21 9L12 15L3 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12V18L12 21L19 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Brivent Portal</h1>
          <p className="muted-text">Select your login type to continue</p>
        </div>

        <div className="role-buttons-container">
          <button
            className="role-btn bribent-admin-btn"
            onClick={handleBribentAdmin}
          >
            <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Login as Brivent Admin
          </button>

          <button
            className="role-btn restaurant-access-btn"
            onClick={() => setShowRestaurantModal(true)}
          >
            <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
              <path d="M9 13H4v4h5v-4zm2 0v4h5v-4h-5z" />
            </svg>
            Restaurant Access
          </button>
        </div>

        <div className="footer-links">
          <a href="#" className="footer-link">Need help?</a>
        </div>
      </div>

      {showRestaurantModal && (
        <div className="modal-overlay-full" onClick={() => setShowRestaurantModal(false)}>
          <div className="modal-content-full" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-full">
              <h2>Restaurant Dashboard Access</h2>
              <button className="modal-close-full" onClick={() => setShowRestaurantModal(false)}>
                <svg className="close-icon-full" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 5.293a1 1 0 011.414 0L12 10.586l5.293-5.293a1 1 0 111.414 1.414L13.414 12l5.293 5.293a1 1 0 01-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 01-1.414-1.414L10.586 12 5.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="modal-body-full">
              <p className="modal-subtitle">Please select your role to access the restaurant dashboard</p>
              <div className="modal-options-full">
                <button
                  className="modal-role-btn-full admin-btn-full"
                  onClick={handleRestaurantAdmin}
                >
                  <svg className="modal-btn-icon-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Login as Restaurant Admin
                </button>
                <button
                  className="modal-role-btn-full staff-btn-full"
                  onClick={handleRestaurantStaff}
                >
                  <svg className="modal-btn-icon-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Login as Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
