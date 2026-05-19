import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { restaurantApi } from '../../api/restaurant';
import { subscriptionApi } from '../../api/subscription';
import './SubscriptionPage.css';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

const plansData = [
  {
    id: 1,
    name: 'Starter',
    price: 15000,
    currency: 'NGN',
    billingCycle: 'monthly',
    description: 'Perfect for small restaurants just getting started with automated ordering.',
    features: [
      'AI order parsing & confirmation',
      'Menu management',
      'Order notifications',
      'Email support',
      'Monthly order reports',
    ],
    maxOrders: 900,
    maxMenuItems: 50,
    maxDeliveryZones: 3,
    whatsappIncluded: true,
  },
  {
    id: 2,
    name: 'Growth',
    price: 35000,
    currency: 'NGN',
    billingCycle: 'monthly',
    description: 'For growing restaurants handling more orders and managing a team.',
    features: [
      'Everything in Starter',
      'Delivery tracking',
      'Analytics dashboard',
      'Priority support',
      'Multi-staff accounts',
      'Custom auto-reply messages',
    ],
    maxOrders: 2000,
    maxMenuItems: 200,
    maxDeliveryZones: 10,
    whatsappIncluded: true,
  },
  {
    id: 3,
    name: 'Pro',
    price: 75000,
    currency: 'NGN',
    billingCycle: 'monthly',
    description: 'For established brands that need full power and custom solutions.',
    features: [
      'Everything in Growth',
      'Custom branding',
      'Multi-location support',
      'Dedicated account manager',
      'Unlimited orders',
      'White-label options',
    ],
    maxOrders: 'Unlimited',
    maxMenuItems: 'Unlimited',
    maxDeliveryZones: 'Unlimited',
    whatsappIncluded: true,
  },
];

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
        const [restaurantData, subscriptionData] = await Promise.all([
          restaurantApi.getCurrent(user.restaurantId),
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

      const subscriptionData = await subscriptionApi.getRestaurantSubscriptionOwn(user.restaurantId);
      setCurrentSubscription(subscriptionData);
      setRestaurant({ ...restaurant, plan: selectedPlan.name });
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Failed to subscribe:', err);
      const errorMessage = err.message || 'Payment failed. Please try again.';
      
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
    return <div className="sub-loading">Loading subscription details...</div>;
  }

  const currentPlan = currentSubscription?.planName || 'No plan selected';

  const isSubscriptionExpired = currentSubscription?.endDate 
    ? new Date(currentSubscription.endDate) < new Date()
    : false;

  return (
    <div className="sub-container">
      <div className="sub-toast-wrapper">
        {toasts.map((t) => (
          <div key={t.id} className={`sub-toast sub-toast--${t.type}`}>
            <span className="sub-toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span className="sub-toast-message">{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="sub-toast-close">
              ✕
            </button>
          </div>
        ))}
      </div>

      <section className="sub-hero">
        <div>
          <p className="sub-eyebrow">Account</p>
          <h1 className="sub-title">Subscription</h1>
          <p className="sub-description">
            Choose a plan that fits your restaurant's needs
          </p>
        </div>
        <div className="sub-hero-side">
          <div>
            <span>Current plan</span>
            <strong>{currentPlan}</strong>
          </div>
          <p>{restaurant?.name || 'Restaurant'}</p>
        </div>
      </section>
      {/*  cureenet sub */}

      <div className="sub-grid">
        <section className="sub-panel">
          <h2 className="sub-panel-title">Current Subscription</h2>
          {currentPlan === 'No plan selected' ? (
            <div className="sub-empty-state">
              <p>No active subscription. Select a plan below to get started.</p>
            </div>
          ) : (
            <div className="sub-list">
              <div className="sub-list-item">
                <span>Plan</span>
                <strong>{currentPlan}</strong>
              </div>
              <div className="sub-list-item">
                <span>Restaurant</span>
                <strong>{restaurant?.name || '-'}</strong>
              </div>
              {currentSubscription && (
                <>
                  <div className="sub-list-item">
                    <span>Status</span>
                    <strong className={isSubscriptionExpired ? 'sub-status--expired' : 'sub-status--active'}>
                      {isSubscriptionExpired ? 'Expired' : currentSubscription.status}
                    </strong>
                  </div>
                  <div className="sub-list-item">
                    <span>Started</span>
                    <strong>{new Date(currentSubscription.startDate).toLocaleDateString()}</strong>
                  </div>
                  {currentSubscription.endDate && (
                    <div className="sub-list-item">
                      <span>Expires</span>
                      <strong>{new Date(currentSubscription.endDate).toLocaleDateString()}</strong>
                    </div>
                  )}
                  <div className="sub-list-item">
                    <span>Amount</span>
                    <strong>{formatNaira(currentSubscription.amount)}/{currentSubscription.billingCycle}</strong>
                  </div>
                  {isSubscriptionExpired && (
                    <div className="sub-expired-banner">
                      Your subscription has expired. Select a plan below to renew.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="sub-plans-section">
        <h2 className="sub-plans-title">Available Plans</h2>
        <div className="sub-plans-grid">
          {plans.map((plan) => {
            const isCurrentPlan = !isSubscriptionExpired && currentSubscription?.planName === plan.name;
            const isExpiredPlan = isSubscriptionExpired && currentSubscription?.planName === plan.name;
            return (
              <div
                key={plan.id}
                className={`sub-plan-card ${isCurrentPlan ? 'sub-plan-card--current' : ''} ${isExpiredPlan ? 'sub-plan-card--expired' : ''}`}
              >
                {isExpiredPlan && (
                  <div className="sub-plan-badge sub-plan-badge--expired">
                    Expired
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="sub-plan-badge sub-plan-badge--current">
                    Current Plan
                  </div>
                )}
                <h3 className="sub-plan-name">{plan.name}</h3>
                <p className="sub-plan-price">
                  {formatNaira(plan.price)}
                  <span className="sub-plan-period">/month</span>
                </p>
                <p className="sub-plan-description">{plan.description}</p>
                <ul className="sub-plan-features">
                  {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <div className="sub-plan-meta">
                  {plan.maxOrders && <div>Max Orders: <span>{plan.maxOrders}</span></div>}
                  {plan.maxMenuItems && <div>Max Menu Items: <span>{plan.maxMenuItems}</span></div>}
                  {plan.maxDeliveryZones && <div>Max Delivery Zones: <span>{plan.maxDeliveryZones}</span></div>}
                  <div>WhatsApp: <span className={plan.whatsappIncluded ? 'sub-meta-included' : 'sub-meta-excluded'}>
                    {plan.whatsappIncluded ? 'Included' : 'Not Included'}
                  </span></div>
                </div>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan}
                  className={`sub-plan-btn ${isCurrentPlan ? 'sub-plan-btn--disabled' : isExpiredPlan ? 'sub-plan-btn--expired' : 'sub-plan-btn--primary'}`}
                >
                  {isCurrentPlan ? 'Current Plan' : isExpiredPlan ? 'Renew' : 'Subscribe'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {showConfirmModal && selectedPlan && (
        <div className="sub-modal">
          <div className="sub-modal-content">
            <h3 className="sub-modal-title">Confirm Subscription</h3>
            <p className="sub-modal-text">
              Are you sure you want to subscribe to <strong>{selectedPlan.name}</strong> for <strong className="sub-highlight">{formatNaira(selectedPlan.price)}/month</strong>?
            </p>
            <div className="sub-modal-actions">
              <button onClick={() => setShowConfirmModal(false)} className="sub-modal-btn sub-modal-btn--cancel">
                Cancel
              </button>
              <button onClick={confirmSubscribe} className="sub-modal-btn sub-modal-btn--confirm">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedPlan && (
        <div className="sub-modal">
          <div className="sub-modal-content sub-modal-content--payment">
            <h3 className="sub-modal-title">Payment</h3>
            
            {!paymentProcessing ? (
              <>
                <div className="sub-payment-details">
                  <div className="sub-payment-row">
                    <span>Plan</span>
                    <strong>{selectedPlan.name}</strong>
                  </div>
                  <div className="sub-payment-row">
                    <span>Billing Cycle</span>
                    <span>{selectedPlan.billingCycle}</span>
                  </div>
                  <div className="sub-payment-row sub-payment-row--total">
                    <span>Total</span>
                    <strong>{formatNaira(selectedPlan.price)}</strong>
                  </div>
                </div>

                <div className="sub-modal-actions">
                  <button onClick={() => setShowPaymentModal(false)} className="sub-modal-btn sub-modal-btn--cancel">
                    Cancel
                  </button>
                  <button onClick={processPayment} className="sub-modal-btn sub-modal-btn--pay">
                    Pay Now
                  </button>
                </div>
              </>
            ) : (
              <div className="sub-payment-processing">
                <div className="sub-spinner"></div>
                <p>Processing payment...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showActiveSubscriptionModal && (
        <div className="sub-modal">
          <div className="sub-modal-content">
            <div className="sub-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="sub-modal-title">Active Subscription Exists</h3>
            <p className="sub-modal-text">
              You already have an active subscription. You can only subscribe to one plan at a time. Please wait for your current subscription to expire before subscribing to a new plan.
            </p>
            {currentSubscription?.endDate && (
              <p className="sub-expiry-info">
                Your current subscription expires on: {new Date(currentSubscription.endDate).toLocaleDateString()}
              </p>
            )}
            <button
              onClick={() => setShowActiveSubscriptionModal(false)}
              className="sub-modal-btn sub-modal-btn--gotit"
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