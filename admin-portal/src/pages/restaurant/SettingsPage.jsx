import React, { useEffect, useState } from 'react';
// import { useAuth } from '../../auth/AuthContext';
// import { restaurantsApi } from '../../api/restaurants';
import PageHeader from '../../components/ui/PageHeader';

const SettingsPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    bankDetails: '',
    paymentInstructions: '',
    botSettings: '',
  });
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const response = await restaurantsApi.getSettings(user.restaurantId);
      if (response) {
        setForm(response);
      }
    };

    load();
  }, [user.restaurantId]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSavedMessage('');
  };

  const save = async (event) => {
    event.preventDefault();
    await restaurantsApi.updateSettings(user.restaurantId, form);
    setSavedMessage('Settings saved (mock).');
  };

  return (
    <div className="stack-md">
      <PageHeader
        title="Settings"
        subtitle="Maintain restaurant profile, payment instructions, and basic bot configuration."
      />

      <form className="card form-grid" onSubmit={save}>
        <h3>Restaurant Settings</h3>

        <div>
          <label htmlFor="setting-name" className="input-label">Restaurant Name</label>
          <input id="setting-name" className="input" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
        </div>

        <div>
          <label htmlFor="setting-contact" className="input-label">Contact Number</label>
          <input id="setting-contact" className="input" value={form.contactNumber} onChange={(event) => updateField('contactNumber', event.target.value)} />
        </div>

        <div>
          <label htmlFor="setting-bank" className="input-label">Bank Details</label>
          <input id="setting-bank" className="input" value={form.bankDetails} onChange={(event) => updateField('bankDetails', event.target.value)} />
        </div>

        <div>
          <label htmlFor="setting-payment-instructions" className="input-label">Payment Instructions</label>
          <textarea
            id="setting-payment-instructions"
            className="input"
            rows="4"
            value={form.paymentInstructions}
            onChange={(event) => updateField('paymentInstructions', event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="setting-bot" className="input-label">Bot Settings (Placeholder)</label>
          <textarea
            id="setting-bot"
            className="input"
            rows="4"
            value={form.botSettings}
            onChange={(event) => updateField('botSettings', event.target.value)}
          />
        </div>

        <div className="actions-row">
          <button type="submit" className="button">Save Settings</button>
          {savedMessage ? <span className="muted-text">{savedMessage}</span> : null}
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;