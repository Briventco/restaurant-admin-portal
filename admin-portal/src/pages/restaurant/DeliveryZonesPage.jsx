import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faEdit,
  faPlus,
  faSpinner,
  faTimes,
  faToggleOff,
  faToggleOn,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../auth/AuthContext';
import { deliveryZonesApi } from '../../api/deliveryZones';

const initialForm = {
  name: '',
  notes: '',
  fee: '',
  etaMinutes: '',
  enabled: true,
};

const badgeStyle = (enabled) => ({
  color: enabled ? '#22c55e' : '#ef4444',
  backgroundColor: enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
  border: enabled ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
});

const actionButtonStyle = {
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid #1e1e1e',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '11px',
};

function DeliveryZonesPage() {
  const { user } = useAuth();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((previous) => [...previous, { id, msg, type }]);
    setTimeout(() => {
      setToasts((previous) => previous.filter((item) => item.id !== id));
    }, 4000);
  };

  useEffect(() => {
    async function loadZones() {
      if (!user?.restaurantId) {
        setZones([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await deliveryZonesApi.listByRestaurant(user.restaurantId);
        setZones(data);
      } catch {
        addToast('Failed to load zones', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadZones();
  }, [user?.restaurantId]);

  const handleAddZone = async (event) => {
    event.preventDefault();
    if (!user?.restaurantId || !form.name.trim() || !form.fee) {
      return;
    }

    setSaving(true);
    try {
      const created = await deliveryZonesApi.create(user.restaurantId, {
        name: form.name.trim(),
        notes: form.notes.trim(),
        fee: Number(form.fee),
        etaMinutes: Number(form.etaMinutes || 0),
        enabled: true,
      });
      setZones((previous) => [...previous, created]);
      setForm(initialForm);
      addToast('Zone added', 'success');
    } catch {
      addToast('Failed to add zone', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleZone = async (zone) => {
    if (!user?.restaurantId) {
      return;
    }

    try {
      const updated = await deliveryZonesApi.update(user.restaurantId, zone.id, {
        enabled: !zone.enabled,
      });
      setZones((previous) => previous.map((item) => (item.id === zone.id ? updated : item)));
      addToast(updated.enabled ? 'Zone enabled' : 'Zone disabled', 'success');
    } catch {
      addToast('Failed to update zone', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!user?.restaurantId || !editing) {
      return;
    }

    try {
      const updated = await deliveryZonesApi.update(user.restaurantId, editing.id, {
        name: editing.name,
        notes: editing.notes || '',
        fee: Number(editing.fee),
        etaMinutes: Number(editing.etaMinutes || 0),
      });
      setZones((previous) => previous.map((item) => (item.id === editing.id ? updated : item)));
      setEditing(null);
      addToast('Zone updated', 'success');
    } catch {
      addToast('Failed to update zone', 'error');
    }
  };

  const handleDeleteZone = async () => {
    if (!user?.restaurantId || !deleting) {
      return;
    }

    try {
      await deliveryZonesApi.delete(user.restaurantId, deleting.id);
      setZones((previous) => previous.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      addToast('Zone deleted', 'success');
    } catch {
      addToast('Failed to delete zone', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
        <FontAwesomeIcon icon={faSpinner} spin /> Loading zones...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: '#111', border: '1px solid #222', fontSize: '12px', color: toast.type === 'success' ? '#22c55e' : '#ef4444', minWidth: '200px' }}>
            {toast.msg}
            <button onClick={() => setToasts((previous) => previous.filter((item) => item.id !== toast.id))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      <div>
        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Restaurant</p>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Delivery Zones</h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>
          {zones.length} zones configured · {zones.filter((zone) => zone.enabled).length} active
        </p>
      </div>

      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px' }}>
        <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px', color: '#22c55e' }} /> Add New Zone
        </p>
        <form onSubmit={handleAddZone} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 120px 120px auto', gap: '10px', alignItems: 'end' }}>
          {[
            { id: 'name', label: 'Zone Name', placeholder: 'e.g. Lagos Island', type: 'text' },
            { id: 'notes', label: 'Notes', placeholder: 'Area notes or landmarks', type: 'text' },
            { id: 'fee', label: 'Fee (NGN)', placeholder: '800', type: 'number' },
            { id: 'etaMinutes', label: 'ETA (mins)', placeholder: '35', type: 'number' },
          ].map(({ id, label, placeholder, type }) => (
            <div key={id}>
              <label style={{ display: 'block', fontSize: '11px', color: '#555', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[id]}
                onChange={(event) => setForm((previous) => ({ ...previous, [id]: event.target.value }))}
                style={{ width: '100%', backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#fff', padding: '9px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            <FontAwesomeIcon icon={faPlus} /> {saving ? 'Saving...' : 'Add'}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 100px 90px 120px 120px', padding: '10px 16px', borderBottom: '1px solid #1a1a1a' }}>
          {['Zone', 'Notes', 'Fee', 'ETA', 'Status', 'Actions'].map((heading) => (
            <p key={heading} style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{heading}</p>
          ))}
        </div>
        {zones.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#555', fontSize: '13px' }}>No delivery zones yet</p>
        ) : zones.map((zone, index) => (
          <div
            key={zone.id}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 100px 90px 120px 120px', padding: '13px 16px', borderBottom: index < zones.length - 1 ? '1px solid #111' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
            onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = '#111'; }}
            onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {editing?.id === zone.id ? (
              <>
                <input value={editing.name} onChange={(event) => setEditing((previous) => ({ ...previous, name: event.target.value }))} style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }} />
                <input value={editing.notes || ''} onChange={(event) => setEditing((previous) => ({ ...previous, notes: event.target.value }))} style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }} />
                <input type="number" value={editing.fee} onChange={(event) => setEditing((previous) => ({ ...previous, fee: event.target.value }))} style={{ width: '80px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }} />
                <input type="number" value={editing.etaMinutes || ''} onChange={(event) => setEditing((previous) => ({ ...previous, etaMinutes: event.target.value }))} style={{ width: '70px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }} />
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, ...badgeStyle(zone.enabled) }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: zone.enabled ? '#22c55e' : '#ef4444' }} />
                    {zone.enabled ? 'Active' : 'Off'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={handleSaveEdit} style={{ ...actionButtonStyle, backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button onClick={() => setEditing(null)} style={{ ...actionButtonStyle, color: '#555' }}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{zone.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{zone.notes || 'No notes'}</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>NGN {zone.fee}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{zone.etaMinutes || '-'} mins</p>
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, ...badgeStyle(zone.enabled) }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: zone.enabled ? '#22c55e' : '#ef4444' }} />
                    {zone.enabled ? 'Active' : 'Off'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setEditing({ ...zone })} style={{ ...actionButtonStyle, color: '#555' }}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button onClick={() => handleToggleZone(zone)} style={{ ...actionButtonStyle, color: zone.enabled ? '#22c55e' : '#555' }}>
                    <FontAwesomeIcon icon={zone.enabled ? faToggleOn : faToggleOff} />
                  </button>
                  <button onClick={() => setDeleting(zone)} style={{ ...actionButtonStyle, border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {deleting ? (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px', width: '340px', maxWidth: '90vw' }}>
            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>Delete zone?</p>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666' }}>"{deleting.name}" will be removed. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDeleting(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteZone} style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DeliveryZonesPage;
