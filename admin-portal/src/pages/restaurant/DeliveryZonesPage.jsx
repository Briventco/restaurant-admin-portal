// ═══════════════════════════════════════════════════════════════
//  DeliveryZonesPage.jsx
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt, faPlus, faEdit, faTrash, faToggleOn,
  faToggleOff, faTimes, faSpinner, faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { runtimeApi } from '../../api/runtime';

const Badge = ({ type, label }) => {
  const s = type === 'active'
    ? { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)'  }
    : { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color }} />
      {label}
    </span>
  );
};

const initialForm = { name: '', keywords: '', fee: '', active: true };

export const DeliveryZonesPage = () => {
  const { user } = useAuth();
  const [zones, setZones]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(initialForm);
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toasts, setToasts]     = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await runtimeApi.getDeliveryZones(user?.restaurantId || 'r1');
      setZones(data);
    } catch { addToast('Failed to load zones', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addZone = (e) => {
    e.preventDefault();
    if (!form.name || !form.fee) return;
    setZones((p) => [...p, { id: `dz_${Date.now()}`, ...form, fee: Number(form.fee), active: true }]);
    setForm(initialForm);
    addToast('Zone added', 'success');
  };

  const toggleZone = (id) => {
    setZones((p) => p.map((z) => z.id === id ? { ...z, active: !z.active } : z));
  };

  const saveEdit = () => {
    setZones((p) => p.map((z) => z.id === editing.id ? { ...z, name: editing.name, fee: Number(editing.fee) } : z));
    setEditing(null);
    addToast('Zone updated', 'success');
  };

  const deleteZone = () => {
    setZones((p) => p.filter((z) => z.id !== deleting.id));
    setDeleting(null);
    addToast('Zone deleted', 'success');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin /> Loading zones…
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
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Delivery Zones</h1>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>{zones.length} zones configured · {zones.filter((z) => z.active).length} active</p>
      </div>

      {/* Add zone form */}
      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px' }}>
        <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px', color: '#22c55e' }} /> Add New Zone
        </p>
        <form onSubmit={addZone} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px auto', gap: '10px', alignItems: 'end' }}>
          {[
            { id: 'name',     label: 'Zone Name',    placeholder: 'e.g. Lagos Island', type: 'text'   },
            { id: 'keywords', label: 'Keywords',     placeholder: 'e.g. VI, island',   type: 'text'   },
            { id: 'fee',      label: 'Fee (₦)',      placeholder: '800',               type: 'number' },
          ].map(({ id, label, placeholder, type }) => (
            <div key={id}>
              <label style={{ display: 'block', fontSize: '11px', color: '#555', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
              <input type={type} placeholder={placeholder} value={form[id]} onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
                style={{ width: '100%', backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#fff', padding: '9px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faPlus} /> Add
          </button>
        </form>
      </div>

      {/* Zones table */}
      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px 120px', padding: '10px 16px', borderBottom: '1px solid #1a1a1a' }}>
          {['Zone', 'Keywords', 'Fee', 'Status', 'Actions'].map((h) => (
            <p key={h} style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: '#444', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</p>
          ))}
        </div>
        {zones.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#555', fontSize: '13px' }}>No delivery zones yet</p>
        ) : zones.map((z, idx) => (
          <div key={z.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px 120px', padding: '13px 16px', borderBottom: idx < zones.length - 1 ? '1px solid #111' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {editing?.id === z.id ? (
              <>
                <input value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }} />
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{z.keywords}</p>
                <input type="number" value={editing.fee} onChange={(e) => setEditing((p) => ({ ...p, fee: e.target.value }))} style={{ width: '80px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '6px 9px', fontSize: '12px', outline: 'none' }} />
                <div><Badge type={z.active ? 'active' : 'inactive'} label={z.active ? 'Active' : 'Off'} /></div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={saveEdit} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', color: '#22c55e', cursor: 'pointer', fontSize: '11px' }}>
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button onClick={() => setEditing(null)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px', color: '#555', cursor: 'pointer', fontSize: '11px' }}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{z.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{z.keywords}</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>₦{z.fee}</p>
                <div><Badge type={z.active ? 'active' : 'inactive'} label={z.active ? 'Active' : 'Off'} /></div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setEditing({ ...z })} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px', color: '#555', cursor: 'pointer', fontSize: '11px' }}><FontAwesomeIcon icon={faEdit} /></button>
                  <button onClick={() => toggleZone(z.id)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '6px', color: z.active ? '#22c55e' : '#555', cursor: 'pointer', fontSize: '11px' }}>
                    <FontAwesomeIcon icon={z.active ? faToggleOn : faToggleOff} />
                  </button>
                  <button onClick={() => setDeleting(z)} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      {deleting && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px', width: '340px', maxWidth: '90vw' }}>
            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>Delete zone?</p>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666' }}>"{deleting.name}" will be removed. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDeleting(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={deleteZone} style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryZonesPage;