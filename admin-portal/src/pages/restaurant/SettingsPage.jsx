import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faSave, faSpinner, faTimes, faCheck,
  faToggleOn, faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import { runtimeApi } from '../../api/runtime';

/* ── Field wrapper ───────────────────────────────────────────── */
const Field = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '11px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
    {children}
    {hint && <p style={{ margin: 0, fontSize: '11px', color: '#444' }}>{hint}</p>}
  </div>
);

const inputStyle = {
  backgroundColor: '#111', border: '1px solid #1e1e1e',
  borderRadius: '8px', color: '#fff', padding: '10px 12px',
  fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

/* ════════════════════════════════════════════════════════════════ */
const SettingsPage = () => {
  const { user } = useAuth();
  const [form, setForm]         = useState({
    name: '', email: '', phone: '', address: '',
    openingHours: '08:00', closingHours: '22:00',
    acceptOrders: true, autoConfirm: false, notifyOnOrder: true,
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [toasts, setToasts]     = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await runtimeApi.getRestaurantSettings(user?.restaurantId || 'r1');
        if (data) setForm((p) => ({ ...p, ...data }));
      } catch { addToast('Failed to load settings', 'error'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await runtimeApi.updateRestaurantSettings(user?.restaurantId || 'r1', form);
      setSaved(true);
      addToast('Settings saved!', 'success');
      setTimeout(() => setSaved(false), 3000);
    } catch { addToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin /> Loading settings…
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toasts */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: '#111', border: '1px solid #222', fontSize: '12px', color: t.type === 'success' ? '#22c55e' : '#ef4444', minWidth: '200px' }}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div>
        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>RESTAURANT</p>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Settings</h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>Restaurant profile, payment instructions, and bot configuration</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Profile section */}
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #1a1a1a' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>
              <FontAwesomeIcon icon={faCog} style={{ color: '#555', marginRight: '8px' }} /> Restaurant Profile
            </p>
          </div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Restaurant Name">
              <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Mama Put Kitchen" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#333'}
                onBlur={(e) => e.target.style.borderColor = '#1e1e1e'} />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="contact@restaurant.ng" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#333'}
                onBlur={(e) => e.target.style.borderColor = '#1e1e1e'} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234 801 234 5678" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#333'}
                onBlur={(e) => e.target.style.borderColor = '#1e1e1e'} />
            </Field>
            <Field label="Address">
              <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Street, City, State" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#333'}
                onBlur={(e) => e.target.style.borderColor = '#1e1e1e'} />
            </Field>
            <Field label="Opening Hours">
              <input type="time" value={form.openingHours} onChange={(e) => update('openingHours', e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="Closing Hours">
              <input type="time" value={form.closingHours} onChange={(e) => update('closingHours', e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
          </div>
        </div>

        {/* Bot settings */}
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #1a1a1a' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>Order Settings</p>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { key: 'acceptOrders',  label: 'Accept Orders',        hint: 'Allow customers to place orders via WhatsApp' },
              { key: 'autoConfirm',   label: 'Auto-confirm Orders',  hint: 'Automatically confirm orders without staff review' },
              { key: 'notifyOnOrder', label: 'Notify on New Order',  hint: 'Send WhatsApp notification when a new order arrives' },
            ].map(({ key, label, hint }, idx, arr) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: idx < arr.length - 1 ? '1px solid #111' : 'none' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#fff' }}>{label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#555' }}>{hint}</p>
                </div>
                <button type="button" onClick={() => update(key, !form[key])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: form[key] ? '#22c55e' : '#333', transition: 'color 0.15s' }}>
                  <FontAwesomeIcon icon={form[key] ? faToggleOn : faToggleOff} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: saved ? '#16a34a' : '#22c55e', border: 'none', borderRadius: '9px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s', minWidth: '130px', justifyContent: 'center' }}>
            {saving ? (
              <><FontAwesomeIcon icon={faSpinner} spin /> Saving…</>
            ) : saved ? (
              <><FontAwesomeIcon icon={faCheck} /> Saved!</>
            ) : (
              <><FontAwesomeIcon icon={faSave} /> Save Settings</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;