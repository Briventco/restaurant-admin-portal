import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminOnboardingApi } from '../../api/adminOnboarding';
import './RestaurantOnboardingWizard.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { return false; }
}

const STEPS = [
  { id: 'info',     label: 'Restaurant Info'  },
  { id: 'account',  label: 'Owner Account'    },
  { id: 'menu',     label: 'Menu Items'       },
  { id: 'settings', label: 'Settings'         },
  { id: 'review',   label: 'Review & Create'  },
];

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR'];
const TIMEZONES  = ['Africa/Lagos', 'Africa/Nairobi', 'Africa/Johannesburg', 'Africa/Accra', 'Europe/London', 'America/New_York'];

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Field ────────────────────────────────────────────────────────────────────

const Field = ({ label, required, hint, children }) => (
  <div className="ob-field">
    <label className="ob-field-label">
      {label}{required && <span className="ob-required">*</span>}
    </label>
    {children}
    {hint && <p className="ob-field-hint">{hint}</p>}
  </div>
);

// ─── Step 1: Restaurant Info ──────────────────────────────────────────────────

const StepInfo = ({ data, setData }) => (
  <div className="ob-step-body">
    <p className="ob-step-desc">Basic details about the restaurant.</p>

    <div className="ob-grid-2">
      <Field label="Restaurant Name" required>
        <input className="ob-input" placeholder="e.g. Mama Titi Kitchen"
          value={data.restaurantName}
          onChange={e => setData(d => ({ ...d, restaurantName: e.target.value }))} />
      </Field>
      <Field label="Business Phone" required>
        <input className="ob-input" placeholder="+234 801 234 5678" type="tel"
          value={data.phone}
          onChange={e => setData(d => ({ ...d, phone: e.target.value }))} />
      </Field>
    </div>

    <Field label="Address" required>
      <input className="ob-input" placeholder="e.g. 12 Bode Thomas Street, Surulere, Lagos"
        value={data.address}
        onChange={e => setData(d => ({ ...d, address: e.target.value }))} />
    </Field>

    <div className="ob-grid-3">
      <Field label="Opening Hours">
        <input className="ob-input" type="time"
          value={data.openingHours}
          onChange={e => setData(d => ({ ...d, openingHours: e.target.value }))} />
      </Field>
      <Field label="Closing Hours">
        <input className="ob-input" type="time"
          value={data.closingHours}
          onChange={e => setData(d => ({ ...d, closingHours: e.target.value }))} />
      </Field>
      <Field label="Currency">
        <select className="ob-input"
          value={data.currency}
          onChange={e => setData(d => ({ ...d, currency: e.target.value }))}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
    </div>

    <Field label="Timezone">
      <select className="ob-input"
        value={data.timezone}
        onChange={e => setData(d => ({ ...d, timezone: e.target.value }))}>
        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
      </select>
    </Field>
  </div>
);

// ─── Step 2: Owner Account ────────────────────────────────────────────────────

const StepAccount = ({ data, setData }) => {
  const [showPwd, setShowPwd] = useState(false);
  const [copied, setCopied]   = useState(false);

  const handleGenerate = () => {
    const pwd = generatePassword();
    setData(d => ({ ...d, adminPassword: pwd }));
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(data.adminPassword);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="ob-step-body">
      <p className="ob-step-desc">
        This creates the portal login for the restaurant owner.
        They'll use these credentials to log in and scan the WhatsApp QR code.
      </p>

      <div className="ob-grid-2">
        <Field label="Owner Full Name" required>
          <input className="ob-input" placeholder="e.g. Fatima Bello"
            value={data.adminDisplayName}
            onChange={e => setData(d => ({ ...d, adminDisplayName: e.target.value }))} />
        </Field>
        <Field label="Login Email" required>
          <input className="ob-input" type="email" placeholder="owner@restaurant.com"
            value={data.adminEmail}
            onChange={e => setData(d => ({ ...d, adminEmail: e.target.value }))} />
        </Field>
      </div>

      <Field label="Password" required hint="Share this with the owner. They can change it after logging in.">
        <div className="ob-pwd-row">
          <div className="ob-pwd-wrap">
            <input
              className="ob-input ob-input--pwd"
              type={showPwd ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={data.adminPassword}
              onChange={e => setData(d => ({ ...d, adminPassword: e.target.value }))}
            />
            <button type="button" className="ob-pwd-eye" onClick={() => setShowPwd(v => !v)}>
              {showPwd ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={handleGenerate}>
            Generate
          </button>
          {data.adminPassword && (
            <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={handleCopy}>
              {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
            </button>
          )}
        </div>
      </Field>
    </div>
  );
};

// ─── Step 3: Menu Items ───────────────────────────────────────────────────────

const BLANK_ITEM = { name: '', category: 'Main', price: '', description: '' };

const StepMenu = ({ data, setData }) => {
  const [draft, setDraft] = useState({ ...BLANK_ITEM });
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!draft.name.trim())          { setError('Item name is required.');  return; }
    if (!draft.price || isNaN(Number(draft.price)) || Number(draft.price) < 0) {
      setError('Enter a valid price.'); return;
    }
    setData(d => ({ ...d, menuItems: [...d.menuItems, { ...draft, price: Number(draft.price) }] }));
    setDraft({ ...BLANK_ITEM });
    setError('');
  };

  const handleRemove = (idx) => {
    setData(d => ({ ...d, menuItems: d.menuItems.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="ob-step-body">
      <p className="ob-step-desc">
        Add the restaurant's menu items now so the bot can take orders immediately.
        You can skip and they can add items themselves later.
      </p>

      {/* Add item form */}
      <div className="ob-menu-form">
        <div className="ob-grid-2">
          <Field label="Item Name">
            <input className="ob-input" placeholder="e.g. Jollof Rice"
              value={draft.name}
              onChange={e => { setDraft(d => ({ ...d, name: e.target.value })); setError(''); }} />
          </Field>
          <Field label="Category">
            <input className="ob-input" placeholder="e.g. Main, Drinks, Snacks"
              value={draft.category}
              onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} />
          </Field>
        </div>
        <div className="ob-grid-2">
          <Field label="Price">
            <input className="ob-input" type="number" min="0" placeholder="e.g. 3500"
              value={draft.price}
              onChange={e => { setDraft(d => ({ ...d, price: e.target.value })); setError(''); }} />
          </Field>
          <Field label="Description (optional)">
            <input className="ob-input" placeholder="Brief description"
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
          </Field>
        </div>
        {error && <p className="ob-inline-error">{error}</p>}
        <button type="button" className="ob-btn ob-btn--primary ob-btn--sm" onClick={handleAdd}>
          <PlusIcon /> Add Item
        </button>
      </div>

      {/* Item list */}
      {data.menuItems.length > 0 && (
        <div className="ob-menu-list">
          {data.menuItems.map((item, idx) => (
            <div key={idx} className="ob-menu-item">
              <div className="ob-menu-item-info">
                <span className="ob-menu-item-name">{item.name}</span>
                <span className="ob-menu-item-cat">{item.category}</span>
              </div>
              <div className="ob-menu-item-right">
                <span className="ob-menu-item-price">
                  {data.currency} {Number(item.price).toLocaleString()}
                </span>
                <button type="button" className="ob-icon-btn ob-icon-btn--danger" onClick={() => handleRemove(idx)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
          <p className="ob-menu-count">{data.menuItems.length} item{data.menuItems.length !== 1 ? 's' : ''} added</p>
        </div>
      )}

      {data.menuItems.length === 0 && (
        <div className="ob-skip-hint">
          No items added yet — that's OK, the owner can add them after logging in.
        </div>
      )}
    </div>
  );
};

// ─── Step 4: Settings ─────────────────────────────────────────────────────────

const BLANK_ZONE = { name: '', coverageArea: '', fee: '', estimatedTime: '' };

const StepSettings = ({ data, setData }) => {
  const [draft, setDraft] = useState({ ...BLANK_ZONE });
  const [error, setError] = useState('');

  const handleAddZone = () => {
    if (!draft.name.trim()) { setError('Zone name is required.'); return; }
    setData(d => ({ ...d, deliveryZones: [...d.deliveryZones, { ...draft, fee: Number(draft.fee) || 0 }] }));
    setDraft({ ...BLANK_ZONE });
    setError('');
  };

  const handleRemoveZone = (idx) => {
    setData(d => ({ ...d, deliveryZones: d.deliveryZones.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="ob-step-body">
      <p className="ob-step-desc">
        Configure the WhatsApp alert number and delivery zones.
        Both can be updated later from the restaurant's settings.
      </p>

      <Field label="Order Alert WhatsApp Number" hint="This number gets a WhatsApp message when a new order arrives. Use international format: +234...">
        <input className="ob-input" type="tel" placeholder="+234 801 234 5678"
          value={data.alertPhone}
          onChange={e => setData(d => ({ ...d, alertPhone: e.target.value }))} />
      </Field>

      <div className="ob-section-label">Delivery Zones <span className="ob-optional">(optional)</span></div>

      <div className="ob-menu-form">
        <div className="ob-grid-2">
          <Field label="Zone Name">
            <input className="ob-input" placeholder="e.g. Lagos Island"
              value={draft.name}
              onChange={e => { setDraft(d => ({ ...d, name: e.target.value })); setError(''); }} />
          </Field>
          <Field label="Coverage Area">
            <input className="ob-input" placeholder="e.g. Victoria Island, Ikoyi"
              value={draft.coverageArea}
              onChange={e => setDraft(d => ({ ...d, coverageArea: e.target.value }))} />
          </Field>
        </div>
        <div className="ob-grid-2">
          <Field label="Delivery Fee">
            <input className="ob-input" type="number" min="0" placeholder="e.g. 1500"
              value={draft.fee}
              onChange={e => setDraft(d => ({ ...d, fee: e.target.value }))} />
          </Field>
          <Field label="Estimated Time">
            <input className="ob-input" placeholder="e.g. 30–45 mins"
              value={draft.estimatedTime}
              onChange={e => setDraft(d => ({ ...d, estimatedTime: e.target.value }))} />
          </Field>
        </div>
        {error && <p className="ob-inline-error">{error}</p>}
        <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={handleAddZone}>
          <PlusIcon /> Add Zone
        </button>
      </div>

      {data.deliveryZones.length > 0 && (
        <div className="ob-menu-list">
          {data.deliveryZones.map((zone, idx) => (
            <div key={idx} className="ob-menu-item">
              <div className="ob-menu-item-info">
                <span className="ob-menu-item-name">{zone.name}</span>
                {zone.coverageArea && <span className="ob-menu-item-cat">{zone.coverageArea}</span>}
              </div>
              <div className="ob-menu-item-right">
                {zone.estimatedTime && <span className="ob-menu-item-cat">{zone.estimatedTime}</span>}
                <span className="ob-menu-item-price">
                  {data.currency} {Number(zone.fee).toLocaleString()}
                </span>
                <button type="button" className="ob-icon-btn ob-icon-btn--danger" onClick={() => handleRemoveZone(idx)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Step 5: Review & Create ──────────────────────────────────────────────────

const ReviewRow = ({ label, value, muted }) => (
  value ? (
    <div className="ob-review-row">
      <span className="ob-review-label">{label}</span>
      <span className={`ob-review-value ${muted ? 'muted' : ''}`}>{value}</span>
    </div>
  ) : null
);

const StepReview = ({ data, submitting, error, onSubmit }) => (
  <div className="ob-step-body">
    <p className="ob-step-desc">Everything looks good? Hit Create to set up the account.</p>

    <div className="ob-review-section">
      <p className="ob-review-heading">🏪 Restaurant</p>
      <ReviewRow label="Name"     value={data.restaurantName} />
      <ReviewRow label="Phone"    value={data.phone} />
      <ReviewRow label="Address"  value={data.address} />
      <ReviewRow label="Hours"    value={`${data.openingHours} – ${data.closingHours}`} />
      <ReviewRow label="Currency" value={data.currency} />
      <ReviewRow label="Timezone" value={data.timezone} />
    </div>

    <div className="ob-review-section">
      <p className="ob-review-heading">👤 Owner Account</p>
      <ReviewRow label="Name"     value={data.adminDisplayName} />
      <ReviewRow label="Email"    value={data.adminEmail} />
      <ReviewRow label="Password" value={'•'.repeat(Math.min(data.adminPassword.length, 12))} muted />
    </div>

    <div className="ob-review-section">
      <p className="ob-review-heading">🍽 Menu</p>
      {data.menuItems.length === 0
        ? <p className="ob-review-empty">No items — owner will add later</p>
        : data.menuItems.map((item, i) => (
            <ReviewRow key={i} label={item.name} value={`${data.currency} ${Number(item.price).toLocaleString()} · ${item.category}`} />
          ))
      }
    </div>

    {(data.alertPhone || data.deliveryZones.length > 0) && (
      <div className="ob-review-section">
        <p className="ob-review-heading">⚙️ Settings</p>
        <ReviewRow label="Alert number" value={data.alertPhone} />
        {data.deliveryZones.map((z, i) => (
          <ReviewRow key={i} label={z.name} value={`${data.currency} ${Number(z.fee).toLocaleString()} · ${z.estimatedTime || 'no ETA'}`} />
        ))}
      </div>
    )}

    {error && <div className="ob-form-error">{error}</div>}

    <button
      type="button"
      className="ob-btn ob-btn--primary ob-btn--create"
      onClick={onSubmit}
      disabled={submitting}
    >
      {submitting ? (
        <><span className="ob-spinner" /> Creating restaurant…</>
      ) : (
        '🚀 Create Restaurant'
      )}
    </button>
  </div>
);

// ─── Step 6: Done ────────────────────────────────────────────────────────────

const StepDone = ({ result, data, onCreateAnother }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState('');

  const portalUrl = window.location.origin + '/login';

  const handleCopy = async (text, key) => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(key); setTimeout(() => setCopied(''), 2000); }
  };

  const allCredentials =
    `Restaurant: ${result.restaurant.name}\nPortal URL: ${portalUrl}\nEmail: ${result.adminUser.email}\nPassword: ${data.adminPassword}`;

  return (
    <div className="ob-step-body ob-done">
      <div className="ob-done-icon">✅</div>
      <h2 className="ob-done-title">{result.restaurant.name} is ready!</h2>
      <p className="ob-done-sub">
        Account created and approved.
        {result.menuItemsCreated > 0 && ` ${result.menuItemsCreated} menu items added.`}
        {result.deliveryZonesCreated > 0 && ` ${result.deliveryZonesCreated} delivery zones added.`}
      </p>

      <div className="ob-creds-box">
        <div className="ob-creds-header">
          <span>Credentials to share with the owner</span>
          <button className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => handleCopy(allCredentials, 'all')}>
            {copied === 'all' ? <><CheckIcon /> All copied</> : <><CopyIcon /> Copy all</>}
          </button>
        </div>

        {[
          { key: 'url',  label: 'Portal URL', value: portalUrl },
          { key: 'email', label: 'Email',      value: result.adminUser.email },
          { key: 'pwd',   label: 'Password',   value: data.adminPassword },
        ].map(({ key, label, value }) => (
          <div key={key} className="ob-cred-row">
            <span className="ob-cred-label">{label}</span>
            <span className="ob-cred-value">{value}</span>
            <button className="ob-icon-btn" onClick={() => handleCopy(value, key)}>
              {copied === key ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        ))}
      </div>

      <div className="ob-next-steps">
        <p className="ob-next-heading">What the owner does next:</p>
        <ol className="ob-next-list">
          <li>Log in at <strong>{portalUrl}</strong> with the credentials above</li>
          <li>Go to <strong>WhatsApp Status</strong> in the sidebar</li>
          <li>Scan the QR code with their WhatsApp</li>
          <li>Done — the bot is live! 🎉</li>
        </ol>
      </div>

      <div className="ob-done-actions">
        <button className="ob-btn ob-btn--ghost" onClick={() => navigate(`/restaurants/${result.restaurantId}`)}>
          View Restaurant
        </button>
        <button className="ob-btn ob-btn--primary" onClick={onCreateAnother}>
          Onboard Another Restaurant
        </button>
      </div>
    </div>
  );
};

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const INITIAL_DATA = {
  // Step 1
  restaurantName: '',
  phone:          '',
  address:        '',
  openingHours:   '08:00',
  closingHours:   '22:00',
  currency:       'NGN',
  timezone:       'Africa/Lagos',
  // Step 2
  adminDisplayName: '',
  adminEmail:       '',
  adminPassword:    '',
  // Step 3
  menuItems: [],
  // Step 4
  alertPhone:    '',
  deliveryZones: [],
};

export default function RestaurantOnboardingWizard() {
  const [step,       setStep]       = useState(0);
  const [data,       setData]       = useState({ ...INITIAL_DATA });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [result,     setResult]     = useState(null);

  const currentStep = STEPS[step];
  const isLastStep  = step === STEPS.length - 1;
  const isDone      = Boolean(result);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = useCallback((stepId) => {
    switch (stepId) {
      case 'info':
        if (!data.restaurantName.trim()) return 'Restaurant name is required.';
        if (!data.phone.trim())          return 'Phone number is required.';
        if (!data.address.trim())        return 'Address is required.';
        return null;
      case 'account':
        if (!data.adminDisplayName.trim()) return 'Owner name is required.';
        if (!data.adminEmail.trim())       return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail)) return 'Enter a valid email address.';
        if (data.adminPassword.length < 6) return 'Password must be at least 6 characters.';
        return null;
      default:
        return null;
    }
  }, [data]);

  const handleNext = () => {
    const err = validate(currentStep.id);
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await adminOnboardingApi.createRestaurant(data);
      setResult(res);
      setStep(STEPS.length); // move past last step to "done"
    } catch (err) {
      setError(err.message || 'Failed to create restaurant. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setData({ ...INITIAL_DATA });
    setResult(null);
    setError('');
    setStep(0);
  };

  // ── Render done state ──────────────────────────────────────────────────────
  if (isDone) {
    return (
      <div className="ob-shell">
        <StepDone result={result} data={data} onCreateAnother={handleReset} />
      </div>
    );
  }

  return (
    <div className="ob-shell">

      {/* Progress bar */}
      <div className="ob-progress">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`ob-progress-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            <div className="ob-progress-dot">
              {i < step ? <CheckIcon /> : <span>{i + 1}</span>}
            </div>
            <span className="ob-progress-label">{s.label}</span>
            {i < STEPS.length - 1 && <div className="ob-progress-line" />}
          </div>
        ))}
      </div>

      {/* Step card */}
      <div className="ob-card">
        <h2 className="ob-card-title">{currentStep.label}</h2>

        {currentStep.id === 'info'     && <StepInfo     data={data} setData={setData} />}
        {currentStep.id === 'account'  && <StepAccount  data={data} setData={setData} />}
        {currentStep.id === 'menu'     && <StepMenu     data={data} setData={setData} />}
        {currentStep.id === 'settings' && <StepSettings data={data} setData={setData} />}
        {currentStep.id === 'review'   && (
          <StepReview
            data={data}
            submitting={submitting}
            error={error}
            onSubmit={handleSubmit}
          />
        )}

        {error && currentStep.id !== 'review' && (
          <p className="ob-form-error">{error}</p>
        )}

        {/* Navigation */}
        {currentStep.id !== 'review' && (
          <div className="ob-nav">
            {step > 0 && (
              <button type="button" className="ob-btn ob-btn--ghost" onClick={handleBack}>
                ← Back
              </button>
            )}
            <div className="ob-nav-right">
              {(currentStep.id === 'menu' || currentStep.id === 'settings') && (
                <button type="button" className="ob-btn ob-btn--ghost" onClick={() => { setError(''); setStep(s => s + 1); }}>
                  Skip
                </button>
              )}
              <button type="button" className="ob-btn ob-btn--primary" onClick={handleNext}>
                {step === STEPS.length - 2 ? 'Review →' : 'Next →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
