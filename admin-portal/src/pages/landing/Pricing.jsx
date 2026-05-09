import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import './Pricing.css';

const plans = [
  {
    name: 'Starter',
    price: '₦15,000',
    period: '/month',
    orders: '900',
    overage: '+₦10 per order above limit',
    description: 'Perfect for small restaurants just getting started with automated ordering.',
    features: [
      'AI order parsing & confirmation',
      'Menu management',
      'Order notifications',
      'Email support',
      'Monthly order reports',
    ],
    popular: false,
  },
  {
    name: 'Growth',
    price: '₦35,000',
    period: '/month',
    orders: '2,000',
    staff: '5',
    overage: '+₦10 per order above limit',
    description: 'For growing restaurants handling more orders and managing a team.',
    features: [
      'Everything in Starter',
      'Delivery tracking',
      'Analytics dashboard',
      'Priority support',
      'Multi-staff accounts',
      'Custom auto-reply messages',
    ],
    popular: true,
  },
  {
    name: 'Pro',
    price: '₦75,000',
    period: '/month',
    orders: 'Unlimited',
    staff: 'Unlimited',
    description: 'For established brands that need full power and custom solutions.',
    features: [
      'Everything in Growth',
      'Custom branding',
      'Multi-location support',
      'Dedicated account manager',
      'Unlimited orders',
      'White-label options',
    ],
    popular: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="prc-app">
      <div className="prc-container">
        <button onClick={() => navigate('/')} className="prc-back">
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <div className="prc-header">
          <motion.h1
            className="prc-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p
            className="prc-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Start small, scale as you grow. No hidden fees, no long-term contracts.
          </motion.p>
        </div>

        <div className="prc-grid">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              className={`prc-card ${plan.popular ? 'prc-card--popular' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
              whileHover={{ y: -8 }}
            >
              {plan.popular && <span className="prc-badge">Most Popular</span>}

              <p className="prc-name">{plan.name}</p>

              <div className="prc-price-row">
                <span className="prc-price">{plan.price}</span>
                <span className="prc-period">{plan.period}</span>
              </div>

              <p className="prc-desc">{plan.description}</p>

              <div className="prc-meta">
                <span>
                  <strong>{plan.orders}</strong> orders/mo
                  {plan.overage && <small style={{ display: 'block', color: '#9ca3af', fontSize: '0.72rem', marginTop: '2px' }}>{plan.overage}</small>}
                </span>
                {plan.staff && <span><strong>{plan.staff}</strong> staff accounts</span>}
              </div>

              <ul className="prc-features">
                {plan.features.map((feat, i) => (
                  <li key={i}>
                    <FontAwesomeIcon icon={faCheck} className="prc-check" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/waitlist')}
                className={`prc-cta ${plan.popular ? 'prc-cta--primary' : 'prc-cta--outline'}`}
              >
                Join Waitlist
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;