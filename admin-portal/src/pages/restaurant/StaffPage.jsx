import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { staffApi } from '../../api/staff';
import './StaffPage.css';

// ─── Icons ───────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  restaurant_staff: 'Staff',
  restaurant_admin: 'Admin',
};

const ROLE_COLORS = {
  restaurant_staff: '#3b82f6',
  restaurant_admin: '#a855f7',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}

function getAvatarColor(name = '') {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Toast ────────────────────────────────────────────────────────────────────

let toastId = 0;

function useToasts() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, push, dismiss };
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.target === overlayRef.current) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="staff-modal-overlay" ref={overlayRef}>
      <div className="staff-modal">
        <div className="staff-modal-header">
          <h2 className="staff-modal-title">{title}</h2>
          <button className="staff-modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Create Staff Modal ───────────────────────────────────────────────────────

const CreateStaffModal = ({ restaurantId, onClose, onCreated }) => {
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    phone: '',
    jobTitle: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.displayName.trim()) { setError('Full name is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const created = await staffApi.create(restaurantId, {
        displayName: form.displayName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        jobTitle: form.jobTitle.trim(),
      });
      onCreated(created);
    } catch (err) {
      setError(err.message || 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add Staff Member" onClose={onClose}>
      <form className="staff-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="staff-form-error">{error}</div>}

        <div className="staff-form-group">
          <label className="staff-form-label">Full Name *</label>
          <input
            className="staff-form-input"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            placeholder="e.g. Amaka Johnson"
            autoFocus
          />
        </div>

        <div className="staff-form-group">
          <label className="staff-form-label">Email Address *</label>
          <input
            className="staff-form-input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="amaka@yourrestaurant.com"
          />
        </div>

        <div className="staff-form-group">
          <label className="staff-form-label">Password *</label>
          <div className="staff-form-input-wrap">
            <input
              className="staff-form-input"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
            />
            <button
              type="button"
              className="staff-form-eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div className="staff-form-row">
          <div className="staff-form-group">
            <label className="staff-form-label">Phone</label>
            <input
              className="staff-form-input"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
            />
          </div>
          <div className="staff-form-group">
            <label className="staff-form-label">Job Title</label>
            <input
              className="staff-form-input"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Chef, Cashier"
            />
          </div>
        </div>

        <div className="staff-form-actions">
          <button type="button" className="staff-btn staff-btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="staff-btn staff-btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Staff'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Edit Staff Modal ─────────────────────────────────────────────────────────

const EditStaffModal = ({ restaurantId, member, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    displayName: member.displayName || '',
    phone: member.phone || '',
    jobTitle: member.jobTitle || '',
    isActive: member.isActive !== false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.displayName.trim()) { setError('Full name is required.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const updated = await staffApi.update(restaurantId, member.uid || member.id, {
        displayName: form.displayName.trim(),
        phone: form.phone.trim(),
        jobTitle: form.jobTitle.trim(),
        isActive: form.isActive,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to update staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Edit Staff Member" onClose={onClose}>
      <form className="staff-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="staff-form-error">{error}</div>}

        <div className="staff-form-group">
          <label className="staff-form-label">Full Name *</label>
          <input
            className="staff-form-input"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            placeholder="Full name"
            autoFocus
          />
        </div>

        <div className="staff-form-row">
          <div className="staff-form-group">
            <label className="staff-form-label">Phone</label>
            <input
              className="staff-form-input"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
            />
          </div>
          <div className="staff-form-group">
            <label className="staff-form-label">Job Title</label>
            <input
              className="staff-form-input"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Chef, Cashier"
            />
          </div>
        </div>

        <div className="staff-form-group staff-form-group--inline">
          <label className="staff-form-label">Active</label>
          <label className="staff-toggle">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <span className="staff-toggle-track">
              <span className="staff-toggle-thumb" />
            </span>
          </label>
        </div>

        <div className="staff-form-actions">
          <button type="button" className="staff-btn staff-btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="staff-btn staff-btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Confirm Deactivate Modal ─────────────────────────────────────────────────

const ConfirmDeactivateModal = ({ member, onClose, onConfirm, loading }) => (
  <Modal title="Deactivate Staff Member" onClose={onClose}>
    <div className="staff-confirm-body">
      <p className="staff-confirm-text">
        Are you sure you want to deactivate <strong>{member.displayName}</strong>?
        They will lose access to the portal immediately.
      </p>
      <div className="staff-form-actions">
        <button className="staff-btn staff-btn--ghost" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="staff-btn staff-btn--danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deactivating…' : 'Deactivate'}
        </button>
      </div>
    </div>
  </Modal>
);

// ─── Staff Card ───────────────────────────────────────────────────────────────

const StaffCard = ({ member, onEdit, onDeactivate }) => {
  const initials = getInitials(member.displayName);
  const avatarColor = getAvatarColor(member.displayName);
  const roleLabel = ROLE_LABELS[member.role] || 'Staff';
  const roleColor = ROLE_COLORS[member.role] || '#3b82f6';

  return (
    <article className="staff-card">
      <div className="staff-card-top">
        <div className="staff-card-avatar" style={{ background: avatarColor }}>
          {initials}
        </div>
        <div className={`staff-card-status ${member.isActive ? 'active' : 'inactive'}`}>
          <span className="staff-card-status-dot" />
          {member.isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="staff-card-info">
        <h3 className="staff-card-name">{member.displayName || '—'}</h3>
        {member.jobTitle && (
          <p className="staff-card-title">{member.jobTitle}</p>
        )}
        <p className="staff-card-email">{member.email}</p>
        {member.phone && <p className="staff-card-phone">{member.phone}</p>}
      </div>

      <div className="staff-card-footer">
        <span className="staff-role-badge" style={{ color: roleColor, borderColor: `${roleColor}33`, background: `${roleColor}12` }}>
          {roleLabel}
        </span>
        <div className="staff-card-actions">
          <button className="staff-icon-btn" onClick={() => onEdit(member)} title="Edit">
            <EditIcon />
          </button>
          {member.isActive && (
            <button className="staff-icon-btn staff-icon-btn--danger" onClick={() => onDeactivate(member)} title="Deactivate">
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ onAdd }) => (
  <div className="staff-empty">
    <div className="staff-empty-icon">
      <UserIcon />
    </div>
    <h3 className="staff-empty-title">No staff members yet</h3>
    <p className="staff-empty-hint">Add your first staff member to give them portal access.</p>
    <button className="staff-btn staff-btn--primary" onClick={onAdd}>
      <PlusIcon /> Add Staff Member
    </button>
  </div>
);

// ─── StaffPage ────────────────────────────────────────────────────────────────

const StaffPage = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const { toasts, push: pushToast, dismiss: dismissToast } = useToasts();

  const restaurantId = user?.restaurantId;

  const loadStaff = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError('');
    try {
      const list = await staffApi.listByRestaurant(restaurantId);
      setStaff(list);
    } catch (err) {
      setError(err.message || 'Failed to load staff.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const handleCreated = (newMember) => {
    setStaff((prev) => [newMember, ...prev]);
    setShowCreate(false);
    pushToast(`${newMember.displayName} added successfully.`);
  };

  const handleUpdated = (updated) => {
    setStaff((prev) => prev.map((m) => (m.uid === updated.uid || m.id === updated.id) ? updated : m));
    setEditTarget(null);
    pushToast('Staff member updated.');
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await staffApi.remove(restaurantId, deactivateTarget.uid || deactivateTarget.id);
      setStaff((prev) =>
        prev.map((m) =>
          (m.uid === deactivateTarget.uid || m.id === deactivateTarget.id)
            ? { ...m, isActive: false }
            : m
        )
      );
      pushToast(`${deactivateTarget.displayName} has been deactivated.`);
      setDeactivateTarget(null);
    } catch (err) {
      pushToast(err.message || 'Failed to deactivate staff.', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const filtered = staff.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.displayName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.jobTitle?.toLowerCase().includes(q)
    );
  });

  const activeCount = staff.filter((m) => m.isActive !== false).length;
  const inactiveCount = staff.length - activeCount;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total Staff', value: staff.length, hint: 'All accounts' },
    { label: 'Active', value: activeCount, hint: 'Portal access enabled', accent: '#22c55e' },
    { label: 'Inactive', value: inactiveCount, hint: 'Access removed', accent: '#ef4444' },
  ];

  return (
    <div className="staff-page">

      {/* Hero ───────────────────────────────────────────────────────────────── */}
      <section className="staff-hero">
        <div className="staff-hero-text">
          <p className="staff-eyebrow">MANAGEMENT</p>
          <h1 className="staff-hero-title">Staff</h1>
          <p className="staff-hero-sub">
            Manage who has access to your restaurant portal. Create accounts for your team and control their access.
          </p>
        </div>
        <div className="staff-hero-actions">
          <button className="staff-btn staff-btn--ghost" onClick={loadStaff} title="Refresh">
            <RefreshIcon /> Refresh
          </button>
          <button className="staff-btn staff-btn--primary" onClick={() => setShowCreate(true)}>
            <PlusIcon /> Add Staff
          </button>
        </div>
      </section>

      {/* Stats ──────────────────────────────────────────────────────────────── */}
      <div className="staff-stats">
        {stats.map((s) => (
          <div className="staff-stat-card" key={s.label}>
            <span className="staff-stat-label">{s.label}</span>
            <strong className="staff-stat-value" style={s.accent ? { color: s.accent } : {}}>
              {s.value}
            </strong>
            <span className="staff-stat-hint">{s.hint}</span>
          </div>
        ))}
      </div>

      {/* Search / Filter bar ─────────────────────────────────────────────────── */}
      <div className="staff-toolbar">
        <div className="staff-search">
          <SearchIcon />
          <input
            className="staff-search-input"
            placeholder="Search by name, email or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="staff-search-clear" onClick={() => setSearch('')}>
              <CloseIcon />
            </button>
          )}
        </div>
        {search && (
          <span className="staff-result-count">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Content ─────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="staff-loading">
          <div className="staff-spinner" />
          <span>Loading staff…</span>
        </div>
      ) : error ? (
        <div className="staff-error">
          <p>{error}</p>
          <button className="staff-btn staff-btn--ghost" onClick={loadStaff}>Try again</button>
        </div>
      ) : filtered.length === 0 && search ? (
        <div className="staff-empty">
          <div className="staff-empty-icon"><SearchIcon /></div>
          <h3 className="staff-empty-title">No results for "{search}"</h3>
          <p className="staff-empty-hint">Try a different name or email.</p>
          <button className="staff-btn staff-btn--ghost" onClick={() => setSearch('')}>Clear search</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => setShowCreate(true)} />
      ) : (
        <div className="staff-grid">
          {filtered.map((member) => (
            <StaffCard
              key={member.uid || member.id}
              member={member}
              onEdit={setEditTarget}
              onDeactivate={setDeactivateTarget}
            />
          ))}
        </div>
      )}

      {/* Modals ──────────────────────────────────────────────────────────────── */}
      {showCreate && (
        <CreateStaffModal
          restaurantId={restaurantId}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {editTarget && (
        <EditStaffModal
          restaurantId={restaurantId}
          member={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={handleUpdated}
        />
      )}

      {deactivateTarget && (
        <ConfirmDeactivateModal
          member={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={handleDeactivate}
          loading={deactivating}
        />
      )}

      {/* Toast stack ─────────────────────────────────────────────────────────── */}
      {toasts.length > 0 && (
        <div className="staff-toast-stack">
          {toasts.map((t) => (
            <div key={t.id} className={`staff-toast ${t.type}`}>
              <span>{t.message}</span>
              <button onClick={() => dismissToast(t.id)}><CloseIcon /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffPage;
