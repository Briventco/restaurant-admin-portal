import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faEdit, faTrash, faSpinner, faCheck, faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { subscriptionApi } from '../../api/subscription';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

const SubscriptionPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'NGN',
    billingCycle: 'monthly',
    features: '',
    maxOrders: '',
    maxMenuItems: '',
    maxDeliveryZones: '',
    whatsappIncluded: true,
    supportLevel: 'standard',
    isActive: true,
  });
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.listPlans();
      setPlans(data);
    } catch (err) {
      addToast('Failed to load plans', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'NGN',
      billingCycle: 'monthly',
      features: '',
      maxOrders: '',
      maxMenuItems: '',
      maxDeliveryZones: '',
      whatsappIncluded: true,
      supportLevel: 'standard',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency || 'NGN',
      billingCycle: plan.billingCycle || 'monthly',
      features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
      maxOrders: plan.maxOrders || '',
      maxMenuItems: plan.maxMenuItems || '',
      maxDeliveryZones: plan.maxDeliveryZones || '',
      whatsappIncluded: plan.whatsappIncluded !== false,
      supportLevel: plan.supportLevel || 'standard',
      isActive: plan.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      await subscriptionApi.deletePlan(planId);
      addToast('Plan deleted successfully', 'success');
      loadPlans();
    } catch (err) {
      addToast('Failed to delete plan', 'error');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const featuresArray = formData.features
      ? formData.features.split(',').map(f => f.trim()).filter(Boolean)
      : [];

    const planData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      currency: formData.currency,
      billingCycle: formData.billingCycle,
      features: featuresArray,
      maxOrders: formData.maxOrders ? Number(formData.maxOrders) : null,
      maxMenuItems: formData.maxMenuItems ? Number(formData.maxMenuItems) : null,
      maxDeliveryZones: formData.maxDeliveryZones ? Number(formData.maxDeliveryZones) : null,
      whatsappIncluded: formData.whatsappIncluded,
      supportLevel: formData.supportLevel,
      isActive: formData.isActive,
    };

    try {
      if (editingPlan) {
        await subscriptionApi.updatePlan(editingPlan.id, planData);
        addToast('Plan updated successfully', 'success');
      } else {
        await subscriptionApi.createPlan(planData);
        addToast('Plan created successfully', 'success');
      }
      setShowModal(false);
      loadPlans();
    } catch (err) {
      addToast('Failed to save plan', 'error');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px', color: '#555' }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '28px' }} />
        <p style={{ margin: 0, fontSize: '13px' }}>Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '9px',
            backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            fontSize: '12px', color: '#fff', minWidth: '240px',
          }}>
            <span style={{ color: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : '#3b82f6' }}>
              <FontAwesomeIcon icon={t.type === 'success' ? faCheck : t.type === 'error' ? faTimes : faSpinner} />
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '11px' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#fff' }}>
            Subscription Plans
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>
            Manage subscription plans for restaurants
          </p>
        </div>
        <button
          onClick={handleCreate}
          style={{
            padding: '10px 20px',
            backgroundColor: '#22c55e',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              backgroundColor: '#0f0f0f',
              border: `1px solid ${plan.isActive ? '#22c55e' : '#333'}`,
              borderRadius: '12px',
              padding: '24px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  {plan.name}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>
                  {formatNaira(plan.price)}
                  <span style={{ fontSize: '14px', fontWeight: 400, color: '#888' }}>/month</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEdit(plan)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#888' }}>
              {plan.description}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: '#555' }}>
                Features
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#aaa' }}>
                {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{feature}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              {plan.maxOrders && (
                <div>
                  <span style={{ color: '#555' }}>Max Orders:</span>{' '}
                  <span style={{ color: '#fff' }}>{plan.maxOrders}</span>
                </div>
              )}
              {plan.maxMenuItems && (
                <div>
                  <span style={{ color: '#555' }}>Max Menu Items:</span>{' '}
                  <span style={{ color: '#fff' }}>{plan.maxMenuItems}</span>
                </div>
              )}
              {plan.maxDeliveryZones && (
                <div>
                  <span style={{ color: '#555' }}>Max Delivery Zones:</span>{' '}
                  <span style={{ color: '#fff' }}>{plan.maxDeliveryZones}</span>
                </div>
              )}
              <div>
                <span style={{ color: '#555' }}>WhatsApp:</span>{' '}
                <span style={{ color: plan.whatsappIncluded ? '#22c55e' : '#ef4444' }}>
                  {plan.whatsappIncluded ? 'Included' : 'Not Included'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1e1e1e' }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: plan.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: plan.isActive ? '#22c55e' : '#ef4444',
              }}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px',
            padding: '24px', width: '500px', maxWidth: '90vw',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                {editingPlan ? 'Edit Plan' : 'Create Plan'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px' }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555' }}>
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555' }}>
                  Price (₦) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555' }}>
                  Features (comma-separated)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={3}
                  placeholder="e.g. Unlimited orders, Priority support, Advanced analytics"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555' }}>
                    Max Orders
                  </label>
                  <input
                    type="number"
                    value={formData.maxOrders}
                    onChange={(e) => setFormData({ ...formData, maxOrders: e.target.value })}
                    min="0"
                    placeholder="Unlimited"
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555' }}>
                    Max Menu Items
                  </label>
                  <input
                    type="number"
                    value={formData.maxMenuItems}
                    onChange={(e) => setFormData({ ...formData, maxMenuItems: e.target.value })}
                    min="0"
                    placeholder="Unlimited"
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555' }}>
                  Max Delivery Zones
                </label>
                <input
                  type="number"
                  value={formData.maxDeliveryZones}
                  onChange={(e) => setFormData({ ...formData, maxDeliveryZones: e.target.value })}
                  min="0"
                  placeholder="Unlimited"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={formData.whatsappIncluded}
                    onChange={(e) => setFormData({ ...formData, whatsappIncluded: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  WhatsApp Included
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Active
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#555' }}>
                  Support Level
                </label>
                <select
                  value={formData.supportLevel}
                  onChange={(e) => setFormData({ ...formData, supportLevel: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                >
                  <option value="standard">Standard</option>
                  <option value="priority">Priority</option>
                  <option value="dedicated">Dedicated</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'transparent',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#aaa',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#22c55e',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editingPlan ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlansPage;
