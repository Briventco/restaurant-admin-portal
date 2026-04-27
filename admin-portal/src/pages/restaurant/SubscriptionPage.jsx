import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { restaurantApi } from '../../api/restaurant';
import { subscriptionApi } from '../../api/subscription';
import './AccountPages.css';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showActiveSubscriptionModal, setShowActiveSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.restaurantId) {
        setLoading(false);
        return;
      }

      try {
        const [restaurantData, plansData, subscriptionData] = await Promise.all([
          restaurantApi.getCurrent(user.restaurantId),
          subscriptionApi.listPlansForRestaurant(user.restaurantId),
          subscriptionApi.getRestaurantSubscriptionOwn(user.restaurantId).catch(() => null),
        ]);

        if (!cancelled) {
          setRestaurant(restaurantData);
          setPlans(plansData);
          setCurrentSubscription(subscriptionData);
        }
      } catch (err) {
        console.error('Failed to load subscription data:', err);
        addToast('Failed to load subscription data', 'error');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.restaurantId]);

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const confirmSubscribe = () => {
    setShowConfirmModal(false);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedPlan) return;

    setPaymentProcessing(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await subscriptionApi.subscribeToPlan(user.restaurantId, {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        billingCycle: selectedPlan.billingCycle,
        autoRenew: true,
      });

      addToast('Payment successful! Subscribed to plan', 'success');

      // Reload data
      const subscriptionData = await subscriptionApi.getRestaurantSubscriptionOwn(user.restaurantId);
      setCurrentSubscription(subscriptionData);
      setRestaurant({ ...restaurant, plan: selectedPlan.name });
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Failed to subscribe:', err);
      const errorMessage = err.message || 'Payment failed. Please try again.';
      
      // Check if it's an active subscription error
      if (errorMessage.includes('active subscription') || errorMessage.includes('expire')) {
        setShowActiveSubscriptionModal(true);
        setShowPaymentModal(false);
      } else {
        addToast(errorMessage, 'error');
        setShowPaymentModal(false);
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return <div className="account-loading">Loading subscription details...</div>;
  }

  const currentPlan = currentSubscription?.planName || 'No plan selected';

  // Check if subscription has expired
  const isSubscriptionExpired = currentSubscription?.endDate 
    ? new Date(currentSubscription.endDate) < new Date()
    : false;

  return (
    <div className="account-page-shell">
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
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '11px' }}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <section className="account-hero">
        <div>
          <p className="account-eyebrow">Account</p>
          <h1>Subscription</h1>
          <p className="account-subtitle">
            Choose a plan that fits your restaurant's needs
          </p>
        </div>
        <div className="account-hero-side">
          <div>
            <span>Current plan</span>
            <strong>{currentPlan}</strong>
          </div>
          <p>{restaurant?.name || 'Restaurant'}</p>
        </div>
      </section>

      <div className="account-grid">
        <section className="account-panel">
          <h2>Current Subscription</h2>
          {currentPlan === 'No plan selected' ? (
            <div style={{
              padding: '40px', textAlign: 'center', color: '#888',
              backgroundColor: '#0a0a0a', borderRadius: '8px',
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                No active subscription. Select a plan below to get started.
              </p>
            </div>
          ) : (
            <div className="account-list">
              <div className="account-list-row">
                <span>Plan</span>
                <strong>{currentPlan}</strong>
              </div>
              <div className="account-list-row">
                <span>Restaurant</span>
                <strong>{restaurant?.name || '-'}</strong>
              </div>
              {currentSubscription && (
                <>
                  <div className="account-list-row">
                    <span>Status</span>
                    <strong style={{ color: isSubscriptionExpired ? '#f59e0b' : '#22c55e' }}>
                      {isSubscriptionExpired ? 'Expired' : currentSubscription.status}
                    </strong>
                  </div>
                  <div className="account-list-row">
                    <span>Started</span>
                    <strong>{new Date(currentSubscription.startDate).toLocaleDateString()}</strong>
                  </div>
                  {currentSubscription.endDate && (
                    <div className="account-list-row">
                      <span>Expires</span>
                      <strong>{new Date(currentSubscription.endDate).toLocaleDateString()}</strong>
                    </div>
                  )}
                  <div className="account-list-row">
                    <span>Amount</span>
                    <strong>{formatNaira(currentSubscription.amount)}/{currentSubscription.billingCycle}</strong>
                  </div>
                  {isSubscriptionExpired && (
                    <div style={{
                      marginTop: '16px', padding: '12px', borderRadius: '8px',
                      backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                      fontSize: '13px', textAlign: 'center',
                    }}>
                      Your subscription has expired. Select a plan below to renew.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <section style={{ marginTop: '32px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700, color: '#fff' }}>
          Available Plans
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {plans.map((plan) => {
            const isCurrentPlan = !isSubscriptionExpired && currentSubscription?.planName === plan.name;
            const isExpiredPlan = isSubscriptionExpired && currentSubscription?.planName === plan.name;
            return (
              <div
                key={plan.id}
                style={{
                  backgroundColor: '#0f0f0f',
                  border: isExpiredPlan ? '2px solid #f59e0b' : isCurrentPlan ? '2px solid #22c55e' : '1px solid #1e1e1e',
                  borderRadius: '12px',
                  padding: '24px',
                  position: 'relative',
                }}
              >
                {isExpiredPlan && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    padding: '4px 8px', borderRadius: '4px',
                    backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                    fontSize: '11px', fontWeight: 600,
                  }}>
                    Expired
                  </div>
                )}
                {isCurrentPlan && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    padding: '4px 8px', borderRadius: '4px',
                    backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e',
                    fontSize: '11px', fontWeight: 600,
                  }}>
                    Current Plan
                  </div>
                )}
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  {plan.name}
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 700, color: '#22c55e' }}>
                  {formatNaira(plan.price)}
                  <span style={{ fontSize: '14px', fontWeight: 400, color: '#888' }}>/month</span>
                </p>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
                  {plan.description}
                </p>
                <ul style={{ margin: '0 0 20px', paddingLeft: '20px', fontSize: '13px', color: '#aaa' }}>
                  {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{feature}</li>
                  ))}
                </ul>
                <div style={{ marginBottom: '20px', fontSize: '12px' }}>
                  {plan.maxOrders && <div>Max Orders: <span style={{ color: '#fff' }}>{plan.maxOrders}</span></div>}
                  {plan.maxMenuItems && <div>Max Menu Items: <span style={{ color: '#fff' }}>{plan.maxMenuItems}</span></div>}
                  {plan.maxDeliveryZones && <div>Max Delivery Zones: <span style={{ color: '#fff' }}>{plan.maxDeliveryZones}</span></div>}
                  <div>WhatsApp: <span style={{ color: plan.whatsappIncluded ? '#22c55e' : '#ef4444' }}>
                    {plan.whatsappIncluded ? 'Included' : 'Not Included'}
                  </span></div>
                </div>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: isCurrentPlan ? '#1a1a1a' : isExpiredPlan ? '#f59e0b' : '#22c55e',
                    border: isCurrentPlan ? '1px solid #333' : 'none',
                    borderRadius: '8px',
                    color: isCurrentPlan ? '#888' : '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isCurrentPlan ? 'Current Plan' : isExpiredPlan ? 'Renew' : 'Subscribe'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedPlan && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px',
            padding: '32px', width: '400px', maxWidth: '90vw',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Confirm Subscription
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#888', lineHeight: 1.5 }}>
              Are you sure you want to subscribe to <strong style={{ color: '#fff' }}>{selectedPlan.name}</strong> for <strong style={{ color: '#22c55e' }}>{formatNaira(selectedPlan.price)}/month</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#aaa',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSubscribe}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#22c55e',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px',
            padding: '32px', width: '400px', maxWidth: '90vw',
          }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Payment
            </h3>
            
            {!paymentProcessing ? (
              <>
                <div style={{
                  backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
                  padding: '20px', marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#888', fontSize: '14px' }}>Plan</span>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{selectedPlan.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#888', fontSize: '14px' }}>Billing Cycle</span>
                    <span style={{ color: '#fff', fontSize: '14px' }}>{selectedPlan.billingCycle}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '12px' }}>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Total</span>
                    <span style={{ color: '#22c55e', fontSize: '18px', fontWeight: 700 }}>{formatNaira(selectedPlan.price)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'transparent',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#aaa',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayment}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#22c55e',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Pay Now
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '48px', height: '48px', margin: '0 auto 16px',
                  border: '4px solid #333', borderTopColor: '#22c55e',
                  borderRadius: '50%', animation: 'spin 1s linear infinite',
                }}></div>
                <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Processing payment...</p>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Subscription Constraint Modal */}
      {showActiveSubscriptionModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: '14px',
            padding: '32px', width: '400px', maxWidth: '90vw',
          }}>
            <div style={{
              width: '48px', height: '48px', margin: '0 auto 16px',
              borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 700, color: '#fff', textAlign: 'center' }}>
              Active Subscription Exists
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#888', lineHeight: 1.5, textAlign: 'center' }}>
              You already have an active subscription. You can only subscribe to one plan at a time. Please wait for your current subscription to expire before subscribing to a new plan.
            </p>
            {currentSubscription?.endDate && (
              <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#f59e0b', textAlign: 'center' }}>
                Your current subscription expires on: {new Date(currentSubscription.endDate).toLocaleDateString()}
              </p>
            )}
            <button
              onClick={() => setShowActiveSubscriptionModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
