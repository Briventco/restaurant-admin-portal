import React, { useState } from 'react';
import '../styles/settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Brivent Admin',
    emailNotifications: true,
    orderAutoRefresh: 30,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved');
  };

  return (
    <div className="settings">
      <h1 className="page-title">Settings</h1>
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h2>General Settings</h2>
          <div className="form-group">
            <label>Site Name</label>
            <input
              type="text"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              Email Notifications
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Order Settings</h2>
          <div className="form-group">
            <label>Auto Refresh (seconds)</label>
            <input
              type="number"
              name="orderAutoRefresh"
              value={settings.orderAutoRefresh}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="save-btn">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;