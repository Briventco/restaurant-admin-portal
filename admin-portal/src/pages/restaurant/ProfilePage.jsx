import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import './AccountPages.css';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="account-page-shell">
      <section className="account-hero">
        <div>
          <p className="account-eyebrow">Account</p>
          <h1>Profile</h1>
          <p className="account-subtitle">
            Your access identity for the restaurant portal, including role and restaurant scope.
          </p>
        </div>
        <div className="account-hero-side">
          <div>
            <span>Role</span>
            <strong>{user?.role || '-'}</strong>
          </div>
          <p>This page is meant for the signed-in operator, not the restaurant settings record.</p>
        </div>
      </section>

      <div className="account-grid">
        <section className="account-panel">
          <h2>Identity</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>Name</span>
              <strong>{user?.name || user?.displayName || '-'}</strong>
            </div>
            <div className="account-list-row">
              <span>Email</span>
              <strong>{user?.email || '-'}</strong>
            </div>
            <div className="account-list-row">
              <span>Role</span>
              <strong>{user?.role || '-'}</strong>
            </div>
          </div>
        </section>

        <section className="account-panel">
          <h2>Scope</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>Restaurant ID</span>
              <strong>{user?.restaurantId || '-'}</strong>
            </div>
            <div className="account-list-row">
              <span>Permissions</span>
              <strong>{Array.isArray(user?.permissions) ? user.permissions.length : 0}</strong>
            </div>
          </div>
        </section>

        <section className="account-panel full">
          <h2>Profile Note</h2>
          <div className="account-note">
            This route now gives users a real landing page instead of falling into a 404. Later, it
            can be expanded with password reset, avatar preferences, audit history, and personal
            notification settings.
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
