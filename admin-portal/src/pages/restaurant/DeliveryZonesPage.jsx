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
        ...form,
        fee: Number(form.fee),
        active: true
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
        name: editing.name,
        fee: Number(editing.fee)
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
        name: groupForm.name,
        description: groupForm.description,
        zoneIds: groupForm.zoneIds
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px', color: '#555', fontSize: '13px' }}>
      <FontAwesomeIcon icon={faSpinner} spin /> Loading zones…
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 14px', borderRadius: '9px', backgroundColor: '#111', border: '1px solid #222', fontSize: '12px', color: t.type === 'success' ? '#22c55e' : '#ef4444', minWidth: '200px' }}>
            {t.msg}
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FontAwesomeIcon icon={faTimes} /></button>
          </div>
        ))}
      </div>

      <div>
        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>RESTAURANT</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>
            {zones.length} zones · {zones.filter((z) => z.active).length} active · {zoneGroups.length} groups
          </p>
        </div>
      </div>

      {zoneGroups.length > 0 && (
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#22c55e', fontSize: '14px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Zone Groups</span>
          </div>
          {zoneGroups.map((group) => (
            <div key={group.id} style={{ borderBottom: '1px solid #111' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer' }}
                onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FontAwesomeIcon icon={expandedGroup === group.id ? faChevronDown : faChevronRight} style={{ color: '#555', fontSize: '10px' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#fff' }}>{group.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#555' }}>{group.zoneIds?.length || 0} zones</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge type={group.active ? 'active' : 'inactive'} label={group.active ? 'Active' : 'Off'} />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleGroup(group.id); }}
                    style={{ background: 'none', border: 'none', color: group.active ? '#22c55e' : '#555', cursor: 'pointer', fontSize: '14px' }}
                  >
                    <FontAwesomeIcon icon={group.active ? faToggleOn : faToggleOff} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeletingGroup(group); }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              {expandedGroup === group.id && (
                <div style={{ padding: '8px 16px 12px 40px' }}>
                  {group.zones?.map((zone) => (
                    <div key={zone.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #0a0a0a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#22c55e', fontSize: '10px' }} />
                        <span style={{ fontSize: '12px', color: '#ccc' }}>{zone.name}</span>
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

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setShowGroupForm(!showGroupForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
            backgroundColor: showGroupForm ? '#1a1a1a' : '#0f0f0f',
            border: '1px solid #1e1e1e', borderRadius: '8px', color: '#fff',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#22c55e' }} />
          {showGroupForm ? 'Cancel Group' : 'Create Zone Group'}
        </button>
      </div>

      {showGroupForm && (
        <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
            <FontAwesomeIcon icon={faLayerGroup} style={{ marginRight: '8px', color: '#22c55e' }} /> New Zone Group
          </p>
          <form onSubmit={addGroup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#555', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lagos Mainland"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#fff', padding: '9px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#555', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))}
                  style={{ width: '100%', backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#fff', padding: '9px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#555', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Zones ({groupForm.zoneIds.length} selected)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                {zones.filter(z => z.active).map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => toggleZoneInGroup(zone.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                      backgroundColor: groupForm.zoneIds.includes(zone.id) ? 'rgba(34,197,94,0.1)' : '#111',
                      border: `1px solid ${groupForm.zoneIds.includes(zone.id) ? 'rgba(34,197,94,0.3)' : '#1e1e1e'}`,
                      borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '4px',
                      border: `2px solid ${groupForm.zoneIds.includes(zone.id) ? '#22c55e' : '#333'}`,
                      backgroundColor: groupForm.zoneIds.includes(zone.id) ? '#22c55e' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', color: '#000'
                    }}>
                      {groupForm.zoneIds.includes(zone.id) && <FontAwesomeIcon icon={faCheck} />}
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#fff' }}>{zone.name}</span>
                      <span style={{ fontSize: '10px', color: '#555', marginLeft: '6px' }}>₦{zone.fee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', backgroundColor: '#22c55e', border: 'none', borderRadius: '8px', color: '#000', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>
              <FontAwesomeIcon icon={faLayerGroup} /> Create Group
            </button>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px' }}>
        <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px', color: '#22c55e' }} /> Add New Zone
        </p>
        <form onSubmit={addZone} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px auto', gap: '10px', alignItems: 'end' }}>
          {[
            { id: 'name', label: 'Zone Name', placeholder: 'e.g. Lagos Island', type: 'text' },
            { id: 'keywords', label: 'Keywords', placeholder: 'e.g. VI, island', type: 'text' },
            { id: 'fee', label: 'Fee (₦)', placeholder: '800', type: 'number' },
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

      {deletingGroup && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px', width: '340px', maxWidth: '90vw' }}>
            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>Delete group?</p>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666' }}>"{deletingGroup.name}" will be removed. Zones will not be deleted.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDeletingGroup(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={deleteGroup} style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryZonesPage;