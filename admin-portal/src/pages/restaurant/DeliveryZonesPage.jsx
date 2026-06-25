import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt, faPlus, faEdit, faTrash, faToggleOn,
  faToggleOff, faTimes, faSpinner, faCheck, faLayerGroup,
  faChevronDown, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { runtimeApi } from '../../api/runtime';

const Badge = ({ type, label }) => {
  const s = type === 'active'
    ? { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' }
    : { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color }} />
      {label}
    </span>
  );
};

const initialForm = { name: '', keywords: '', fee: '', active: true };
const initialGroupForm = { name: '', description: '', zoneIds: [] };

const inputStyle = {
  width: '100%',
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  padding: '9px 12px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: 'var(--text-muted)',
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: 600,
};

const COLS = '160px 1fr 90px 90px 106px';

export const DeliveryZonesPage = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState([]);
  const [zoneGroups, setZoneGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [groupForm, setGroupForm] = useState(initialGroupForm);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const addToast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [zonesData, groupsData] = await Promise.all([
        runtimeApi.getDeliveryZones(user?.restaurantId || 'r1'),
        runtimeApi.getDeliveryZoneGroups(user?.restaurantId || 'r1')
      ]);
      setZones(zonesData);
      setZoneGroups(groupsData);
    } catch { addToast('Failed to load zones', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addZone = async (e) => {
    e.preventDefault();
    if (!form.name || !form.fee) return;
    try {
      const newZone = await runtimeApi.createDeliveryZone(user?.restaurantId || 'r1', {
        ...form, fee: Number(form.fee), active: true
      });
      setZones((p) => [...p, newZone]);
      setForm(initialForm);
      addToast('Zone added', 'success');
    } catch { addToast('Failed to add zone', 'error'); }
  };

  const toggleZone = async (id) => {
    try {
      const updated = await runtimeApi.toggleDeliveryZone(user?.restaurantId || 'r1', id);
      setZones((p) => p.map((z) => z.id === id ? updated : z));
    } catch { addToast('Failed to update zone', 'error'); }
  };

  const saveEdit = async () => {
    try {
      const updated = await runtimeApi.updateDeliveryZone(user?.restaurantId || 'r1', editing.id, {
        name: editing.name, fee: Number(editing.fee)
      });
      setZones((p) => p.map((z) => z.id === editing.id ? updated : z));
      setEditing(null);
      addToast('Zone updated', 'success');
    } catch { addToast('Failed to update zone', 'error'); }
  };

  const deleteZone = async () => {
    try {
      await runtimeApi.deleteDeliveryZone(user?.restaurantId || 'r1', deleting.id);
      setZones((p) => p.filter((z) => z.id !== deleting.id));
      setDeleting(null);
      addToast('Zone deleted', 'success');
    } catch { addToast('Failed to delete zone', 'error'); }
  };

  const toggleZoneInGroup = (zoneId) => {
    setGroupForm((p) => ({
      ...p,
      zoneIds: p.zoneIds.includes(zoneId)
        ? p.zoneIds.filter(id => id !== zoneId)
        : [...p.zoneIds, zoneId]
    }));
  };

  const addGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name || groupForm.zoneIds.length === 0) return;
    try {
      const newGroup = await runtimeApi.createDeliveryZoneGroup(user?.restaurantId || 'r1', {
        name: groupForm.name, description: groupForm.description, zoneIds: groupForm.zoneIds
      });
      setZoneGroups((p) => [...p, newGroup]);
      setGroupForm(initialGroupForm);
      setShowGroupForm(false);
      addToast('Zone group created', 'success');
    } catch { addToast('Failed to create group', 'error'); }
  };

  const toggleGroup = async (id) => {
    try {
      const updated = await runtimeApi.toggleDeliveryZoneGroup(user?.restaurantId || 'r1', id);
      setZoneGroups((p) => p.map((g) => g.id === id ? updated : g));
    } catch { addToast('Failed to update group', 'error'); }
  };

  const deleteGroup = async () => {
    try {
      await runtimeApi.deleteDeliveryZoneGroup(user?.restaurantId || 'r1', deletingGroup.id);
      setZoneGroups((p) => p.filter((g) => g.id !== deletingGroup.id));
      setDeletingGroup(null);
      addToast('Group deleted', 'success');
    } catch { addToast('Failed to delete group', 'error'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin /> Loading zones…
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: 'var(--bg-input)', border: '1px solid #222', fontSize: '12px', color: t.type === 'success' ? '#22c55e' : '#ef4444', minWidth: '200px' }}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700 }}>Delivery Zones</p>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
          {zones.length} zones · {zones.filter((z) => z.active).length} active · {zoneGroups.length} groups
        </p>
      </div>

      {zoneGroups.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-elevated)' }}>
            <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#22c55e', fontSize: '13px' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Zone Groups</span>
          </div>
          {zoneGroups.map((group) => (
            <div key={group.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', cursor: 'pointer' }}
                onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FontAwesomeIcon icon={expandedGroup === group.id ? faChevronDown : faChevronRight} style={{ color: 'var(--text-muted)', fontSize: '10px' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{group.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>{group.zoneIds?.length || 0} zones</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Badge type={group.active ? 'active' : 'inactive'} label={group.active ? 'Active' : 'Off'} />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleGroup(group.id); }}
                    style={{ background: 'none', border: 'none', color: group.active ? '#22c55e' : 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: '2px' }}
                  >
                    <FontAwesomeIcon icon={group.active ? faToggleOn : faToggleOff} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeletingGroup(group); }}
                    style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '11px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              {expandedGroup === group.id && (
                <div style={{ padding: '4px 18px 14px 46px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.zones?.map((zone) => (
                    <div key={zone.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#22c55e', fontSize: '10px' }} />
                        <span style={{ fontSize: '12px', color: 'var(--nav-hover-color)' }}>{zone.name}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>₦{zone.fee}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <button
          onClick={() => setShowGroupForm(!showGroupForm)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px',
            backgroundColor: showGroupForm ? 'var(--bg-elevated)' : 'var(--bg-surface)',
            border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#22c55e' }} />
          {showGroupForm ? 'Cancel' : 'Create Zone Group'}
        </button>
      </div>

      {showGroupForm && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            <FontAwesomeIcon icon={faLayerGroup} style={{ marginRight: '8px', color: '#22c55e' }} /> New Zone Group
          </p>
          <form onSubmit={addGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Group Name</label>
                <input type="text" placeholder="e.g. Lagos Mainland" value={groupForm.name}
                  onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input type="text" placeholder="Optional description" value={groupForm.description}
                  onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Select Zones ({groupForm.zoneIds.length} selected)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                {zones.filter(z => z.active).map((zone) => (
                  <div key={zone.id} onClick={() => toggleZoneInGroup(zone.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px',
                      backgroundColor: groupForm.zoneIds.includes(zone.id) ? 'rgba(34,197,94,0.1)' : 'var(--bg-input)',
                      border: `1px solid ${groupForm.zoneIds.includes(zone.id) ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                      borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                      border: `2px solid ${groupForm.zoneIds.includes(zone.id) ? '#22c55e' : 'var(--border-focus)'}`,
                      backgroundColor: groupForm.zoneIds.includes(zone.id) ? '#22c55e' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000',
                    }}>
                      {groupForm.zoneIds.includes(zone.id) && <FontAwesomeIcon icon={faCheck} />}
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{zone.name}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '6px' }}>₦{zone.fee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faLayerGroup} /> Create Group
            </button>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
        <p style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px', color: '#22c55e' }} /> Add New Zone
        </p>
        <div style={{ overflowX: 'auto' }}>
          <form onSubmit={addZone} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px auto', gap: '12px', alignItems: 'end', minWidth: '480px' }}>
            {[
              { id: 'name', label: 'Zone Name', placeholder: 'e.g. Lagos Island', type: 'text' },
              { id: 'keywords', label: 'Keywords', placeholder: 'e.g. VI, island', type: 'text' },
              { id: 'fee', label: 'Fee (₦)', placeholder: '800', type: 'number' },
            ].map(({ id, label, placeholder, type }) => (
              <div key={id}>
                <label style={labelStyle}>{label}</label>
                <input type={type} placeholder={placeholder} value={form[id]}
                  onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', height: '40px' }}>
              <FontAwesomeIcon icon={faPlus} /> Add Zone
            </button>
          </form>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '560px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '11px 18px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
              {['Zone', 'Keywords', 'Fee', 'Status', 'Actions'].map((h) => (
                <p key={h} style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</p>
              ))}
            </div>
            {zones.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '13px' }}>No delivery zones yet</p>
            ) : zones.map((z, idx) => (
              <div
                key={z.id}
                style={{ display: 'grid', gridTemplateColumns: COLS, padding: '13px 18px', borderBottom: idx < zones.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {editing?.id === z.id ? (
                  <>
                    <input value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-focus)', borderRadius: '6px', color: 'var(--text-primary)', padding: '7px 10px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{z.keywords}</p>
                    <input type="number" value={editing.fee} onChange={(e) => setEditing((p) => ({ ...p, fee: e.target.value }))}
                      style={{ width: '80px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-focus)', borderRadius: '6px', color: 'var(--text-primary)', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    <div><Badge type={z.active ? 'active' : 'inactive'} label={z.active ? 'Active' : 'Off'} /></div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={saveEdit} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', color: '#22c55e', cursor: 'pointer', fontSize: '11px' }}>
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button onClick={() => setEditing(null)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{z.name}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{z.keywords}</p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>₦{z.fee}</p>
                    <div><Badge type={z.active ? 'active' : 'inactive'} label={z.active ? 'Active' : 'Off'} /></div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setEditing({ ...z })} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button onClick={() => toggleZone(z.id)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: z.active ? '#22c55e' : 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}>
                        <FontAwesomeIcon icon={z.active ? faToggleOn : faToggleOff} />
                      </button>
                      <button onClick={() => setDeleting(z)} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {deleting && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', width: '360px', maxWidth: '100%' }}>
            <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Delete zone?</p>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>"{deleting.name}" will be removed. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleting(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={deleteZone} style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {deletingGroup && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', width: '360px', maxWidth: '100%' }}>
            <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Delete group?</p>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>"{deletingGroup.name}" will be removed. Zones will not be deleted.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeletingGroup(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={deleteGroup} style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryZonesPage;