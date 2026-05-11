import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowTrendUp,
  faClock,
  faCreditCard,
  faListCheck,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import './AccountPages.css';

const PaymentsPage = () => {
  return (
    <div className="account-page-shell">
      <section className="account-hero">
        <div>
          {/* <p className="account-eyebrow">Payments</p> */}
          <h1>Payment Overview</h1>
          <p className="account-subtitle">
            Track payment statuses, methods, and revenue from all your orders in one place.
          </p>
        </div>
      </section>

      <div className="account-kpi-grid">
        <article className="account-kpi">
          <span>Total Revenue</span>
          <strong>
            <FontAwesomeIcon icon={faArrowTrendUp} /> ₦0
          </strong>
          <p>Total earnings from paid orders this month.</p>
        </article>

        <article className="account-kpi">
          <span>Pending Payments</span>
          <strong>
            <FontAwesomeIcon icon={faClock} /> 0
          </strong>
          <p>Orders awaiting payment confirmation.</p>
        </article>

        <article className="account-kpi">
          <span>Payment Methods Used</span>
          <strong>
            <FontAwesomeIcon icon={faCreditCard} /> 0
          </strong>
          <p>Unique payment methods across all orders.</p>
        </article>
      </div>

      <div className="account-grid">
        <section className="account-panel">
          <h2>Recent Transactions</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>No transactions yet</span>
              <strong>—</strong>
            </div>
          </div>
        </section>

        <section className="account-panel">
          <h2>Payment Methods</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>WhatsApp Pay</span>
              <strong>Active</strong>
            </div>
            <div className="account-list-row">
              <span>Bank Transfer</span>
              <strong>Active</strong>
            </div>
            <div className="account-list-row">
              <span>Cash on Delivery</span>
              <strong>Active</strong>
            </div>
            <div className="account-list-row">
              <span>Card</span>
              <strong>Active</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentsPage;