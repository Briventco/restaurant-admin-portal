import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import './Pricing.css';

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Pricing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const pricingPlans = [
    {
      id: 1,
      name: 'Starter',
      price: '₦15,000',
      period: '/mo',
      orders: '900',
      overage: '+₦10 per order above limit',
      popular: false,
      features: [
        'AI order parsing & confirmation',
        'Menu management',
        'Order notifications',
        'Email support',
        'Monthly order reports'
      ],
    },
    {
      id: 2,
      name: 'Growth',
      price: '₦35,000',
      period: '/mo',
      orders: '2,000',
      staff: '5',
      overage: '+₦10 per order above limit',
      popular: true,
      features: [
        'Everything in Starter',
        'Delivery tracking',
        'Analytics dashboard',
        'Priority support',
        'Multi-staff accounts',
        'Custom auto-reply messages'
      ],
    },
    {
      id: 3,
      name: 'Pro',
      price: '₦75,000',
      period: '/mo',
      orders: 'Unlimited',
      staff: 'Unlimited',
      popular: false,
      features: [
        'Everything in Growth',
        'Custom branding',
        'Multi-location support',
        'Dedicated account manager',
        'Unlimited orders',
        'White-label options'
      ],
    },
  ];

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    alert(`You selected the ${plan.name} plan for ${plan.price}/month.\n\nThis is a demo. No actual subscription was created.`);
  };

  return (
    <div className="pricing-app pricing-app--dark">
      <button
        className="pricing-theme-btn"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="pricing-container">
        <button onClick={() => navigate('/')} className="pricing-back">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
        </button>

        <div className="pricing-header">
          <h1 className="pricing-title">Simple, transparent pricing</h1>
          <p className="pricing-sub">
            Start small, scale as you grow. No hidden fees, no long-term contracts.
          </p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={idx}
              className={`pricing-card ${plan.popular ? 'pricing-card--popular' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
            >
              {plan.popular && (
                <span className="pricing-badge">Most Popular</span>
              )}
              <p className="pricing-plan-name">{plan.name}</p>
              <div className="pricing-price-row">
                <span className="pricing-price">{plan.price}</span>
                <span className="pricing-period">{plan.period}</span>
              </div>
              <div className="pricing-meta">
                <span>
                  <strong>{plan.orders}</strong> orders/mo
                  {plan.overage && (
                    <small className="pricing-overage">{plan.overage}</small>
                  )}
                </span>
                {plan.staff && <span><strong>{plan.staff}</strong> staff accounts</span>}
              </div>
              <ul className="pricing-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <FontAwesomeIcon icon={faCheckCircle} className="pricing-check" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                className={`pricing-btn ${plan.popular ? 'pricing-btn--primary' : 'pricing-btn--outline'}`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;