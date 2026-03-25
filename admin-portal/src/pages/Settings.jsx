import React, { useState } from 'react';
import '../styles/settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showToast, setShowToast] = useState(null);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Brivent Admin',
    siteLogo: 'fas fa-message',
    siteEmail: 'admin@brivent.com',
    sitePhone: '+234 801 234 5678',
    siteAddress: 'Lagos, Nigeria',
    timezone: 'Africa/Lagos',
    dateFormat: 'DD/MM/YYYY',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    orderCreated: true,
    orderUpdated: true,
    orderCompleted: true,
    paymentReceived: true,
    newCustomer: false,
    
    // Order Settings
    orderAutoRefresh: 30,
    defaultOrderStatus: 'Pending',
    enableAutoPrint: false,
    requireCustomerPhone: true,
    requireCustomerAddress: true,
    
    // Invoice Settings
    invoicePrefix: 'INV',
    invoiceLogo: true,
    invoiceFooter: 'Thank you for your business!',
    taxRate: 7.5,
    currencySymbol: '₦',
    currencyPosition: 'before',
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    
    // Appearance
    darkMode: true,
    sidebarCollapsed: false,
    animationsEnabled: true,
    compactView: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [backupCodes, setBackupCodes] = useState([
    'XXXX-XXXX-XXXX',
    'YYYY-YYYY-YYYY',
    'ZZZZ-ZZZZ-ZZZZ',
  ]);

  const showToastMessage = (message, type) => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showToastMessage('Settings saved successfully', 'success');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToastMessage('New passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToastMessage('Password must be at least 6 characters', 'error');
      return;
    }
    showToastMessage('Password changed successfully', 'success');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const generateNewBackupCodes = () => {
    const newCodes = [];
    for (let i = 0; i < 3; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      newCodes.push(`${code.slice(0,4)}-${code.slice(4,8)}`);
    }
    setBackupCodes(newCodes);
    showToastMessage('New backup codes generated', 'success');
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'brivent-settings.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToastMessage('Settings exported successfully', 'success');
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      window.location.reload();
    }
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ WARNING: This will delete all orders and customer data. This action cannot be undone. Are you sure?')) {
      showToastMessage('Clear data feature - implement with backend', 'info');
    }
  };

  return (
    <div className="settings">
      {showToast && (
        <div className={`toast toast-${showToast.type}`}>
          <i className={`fas ${showToast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{showToast.message}</span>
          <button onClick={() => setShowToast(null)} className="toast-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="settings-header">
        <h1 className="page-title">Settings</h1>
        <div className="header-actions">
          <button className="export-btn" onClick={exportSettings}>
            <i className="fas fa-download"></i>
            Export
          </button>
          <button className="reset-btn" onClick={resetSettings}>
            <i className="fas fa-undo"></i>
            Reset
          </button>
        </div>
      </div>

      <div className="settings-tabs">
        <button 
          className={activeTab === 'general' ? 'active' : ''} 
          onClick={() => setActiveTab('general')}
        >
          <i className="fas fa-cog"></i>
          General
        </button>
        <button 
          className={activeTab === 'notifications' ? 'active' : ''} 
          onClick={() => setActiveTab('notifications')}
        >
          <i className="fas fa-bell"></i>
          Notifications
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          <i className="fas fa-shopping-cart"></i>
          Orders
        </button>
        <button 
          className={activeTab === 'invoice' ? 'active' : ''} 
          onClick={() => setActiveTab('invoice')}
        >
          <i className="fas fa-file-invoice"></i>
          Invoice
        </button>
        <button 
          className={activeTab === 'security' ? 'active' : ''} 
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-shield-alt"></i>
          Security
        </button>
        <button 
          className={activeTab === 'appearance' ? 'active' : ''} 
          onClick={() => setActiveTab('appearance')}
        >
          <i className="fas fa-palette"></i>
          Appearance
        </button>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* General Settings */}
        {activeTab === 'general' && (
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

            <div className="form-group">
              <label>Site Logo Icon</label>
              <select name="siteLogo" value={settings.siteLogo} onChange={handleChange}>
                <option value="fas fa-message">Message Icon</option>
                <option value="fas fa-store">Store Icon</option>
                <option value="fas fa-shopping-bag">Shopping Bag</option>
                <option value="fas fa-utensils">Utensils</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Site Email</label>
                <input
                  type="email"
                  name="siteEmail"
                  value={settings.siteEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Site Phone</label>
                <input
                  type="text"
                  name="sitePhone"
                  value={settings.sitePhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Site Address</label>
              <textarea
                name="siteAddress"
                value={settings.siteAddress}
                onChange={handleChange}
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Timezone</label>
                <select name="timezone" value={settings.timezone} onChange={handleChange}>
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date Format</label>
                <select name="dateFormat" value={settings.dateFormat} onChange={handleChange}>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2>Notification Preferences</h2>
            
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

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={settings.pushNotifications}
                  onChange={handleChange}
                />
                Push Notifications
              </label>
            </div>

            <div className="notification-divider">
              <h3>Notify me when:</h3>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="orderCreated"
                  checked={settings.orderCreated}
                  onChange={handleChange}
                  disabled={!settings.emailNotifications && !settings.pushNotifications}
                />
                Order is created
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="orderUpdated"
                  checked={settings.orderUpdated}
                  onChange={handleChange}
                  disabled={!settings.emailNotifications && !settings.pushNotifications}
                />
                Order status is updated
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="orderCompleted"
                  checked={settings.orderCompleted}
                  onChange={handleChange}
                  disabled={!settings.emailNotifications && !settings.pushNotifications}
                />
                Order is completed
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="paymentReceived"
                  checked={settings.paymentReceived}
                  onChange={handleChange}
                  disabled={!settings.emailNotifications && !settings.pushNotifications}
                />
                Payment is received
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="newCustomer"
                  checked={settings.newCustomer}
                  onChange={handleChange}
                  disabled={!settings.emailNotifications && !settings.pushNotifications}
                />
                New customer registers
              </label>
            </div>
          </div>
        )}

        {/* Order Settings */}
        {activeTab === 'orders' && (
          <div className="settings-section">
            <h2>Order Settings</h2>

            <div className="form-group">
              <label>Auto Refresh (seconds)</label>
              <input
                type="number"
                name="orderAutoRefresh"
                value={settings.orderAutoRefresh}
                onChange={handleChange}
                min="5"
                max="300"
              />
              <small>Set to 0 to disable auto refresh</small>
            </div>

            <div className="form-group">
              <label>Default Order Status</label>
              <select name="defaultOrderStatus" value={settings.defaultOrderStatus} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="enableAutoPrint"
                  checked={settings.enableAutoPrint}
                  onChange={handleChange}
                />
                Auto-print order receipt
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="requireCustomerPhone"
                  checked={settings.requireCustomerPhone}
                  onChange={handleChange}
                />
                Require customer phone number for orders
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="requireCustomerAddress"
                  checked={settings.requireCustomerAddress}
                  onChange={handleChange}
                />
                Require customer address for delivery
              </label>
            </div>
          </div>
        )}

        {/* Invoice Settings */}
        {activeTab === 'invoice' && (
          <div className="settings-section">
            <h2>Invoice Settings</h2>

            <div className="form-group">
              <label>Invoice Prefix</label>
              <input
                type="text"
                name="invoicePrefix"
                value={settings.invoicePrefix}
                onChange={handleChange}
                maxLength="10"
              />
              <small>Example: INV-001, ORD-001</small>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="invoiceLogo"
                  checked={settings.invoiceLogo}
                  onChange={handleChange}
                />
                Show logo on invoice
              </label>
            </div>

            <div className="form-group">
              <label>Invoice Footer Message</label>
              <textarea
                name="invoiceFooter"
                value={settings.invoiceFooter}
                onChange={handleChange}
                rows="2"
                placeholder="Thank you for your business!"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={settings.taxRate}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Currency Symbol</label>
                <input
                  type="text"
                  name="currencySymbol"
                  value={settings.currencySymbol}
                  onChange={handleChange}
                  maxLength="3"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Currency Position</label>
              <select name="currencyPosition" value={settings.currencyPosition} onChange={handleChange}>
                <option value="before">Before amount (₦ 100)</option>
                <option value="after">After amount (100 ₦)</option>
              </select>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <>
            <div className="settings-section">
              <h2>Security Settings</h2>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onChange={handleChange}
                  />
                  Enable Two-Factor Authentication
                </label>
                <small>Adds an extra layer of security to your account</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    min="5"
                    max="120"
                  />
                </div>
                <div className="form-group">
                  <label>Max Login Attempts</label>
                  <input
                    type="number"
                    name="maxLoginAttempts"
                    value={settings.maxLoginAttempts}
                    onChange={handleChange}
                    min="3"
                    max="10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password Expiry (days)</label>
                <input
                  type="number"
                  name="passwordExpiry"
                  value={settings.passwordExpiry}
                  onChange={handleChange}
                  min="30"
                  max="365"
                />
                <small>Set to 0 to disable password expiry</small>
              </div>
            </div>

            <div className="settings-section">
              <h2>Change Password</h2>
              <div className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <button type="button" className="change-password-btn" onClick={handlePasswordSubmit}>
                  Change Password
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h2>Backup Codes</h2>
              <p className="backup-info">Use these codes to access your account if you lose your 2FA device.</p>
              <div className="backup-codes">
                {backupCodes.map((code, index) => (
                  <div key={index} className="backup-code">{code}</div>
                ))}
              </div>
              <button type="button" className="generate-codes-btn" onClick={generateNewBackupCodes}>
                <i className="fas fa-sync-alt"></i>
                Generate New Codes
              </button>
            </div>
          </>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="settings-section">
            <h2>Appearance Settings</h2>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="darkMode"
                  checked={settings.darkMode}
                  onChange={handleChange}
                />
                Dark Mode
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="sidebarCollapsed"
                  checked={settings.sidebarCollapsed}
                  onChange={handleChange}
                />
                Collapse Sidebar by Default
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="animationsEnabled"
                  checked={settings.animationsEnabled}
                  onChange={handleChange}
                />
                Enable Animations
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="compactView"
                  checked={settings.compactView}
                  onChange={handleChange}
                />
                Compact View (Show more items per page)
              </label>
            </div>

            <div className="preview-section">
              <h3>Preview</h3>
              <div className="preview-box">
                <div className="preview-header">
                  <i className={settings.siteLogo}></i>
                  <span>{settings.siteName}</span>
                </div>
                <div className="preview-content">
                  <p>This is how your dashboard will look</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="save-btn">
            <i className="fas fa-save"></i>
            Save All Settings
          </button>
          <button type="button" className="clear-data-btn" onClick={clearAllData}>
            <i className="fas fa-trash-alt"></i>
            Clear All Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;