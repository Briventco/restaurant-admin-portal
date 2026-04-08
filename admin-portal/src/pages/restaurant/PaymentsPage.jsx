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
          <p className="account-eyebrow">Payments</p>
          <h1>Payments are not fully implemented yet</h1>
          <p className="account-subtitle">
            This page is intentionally positioned as a preview. Real payment collection, settlement,
            payout tracking, and reconciliation are not yet wired into the restaurant portal.
          </p>
        </div>

        <div className="account-hero-side">
          <div>
            <span>Current status</span>
            <strong>Preview Only</strong>
          </div>
          <p>Operations can view order flow today, but payment infrastructure still needs a dedicated implementation pass.</p>
        </div>
      </section>

      <div className="account-kpi-grid">
        <article className="account-kpi">
          <span>What exists now</span>
          <strong>
            <FontAwesomeIcon icon={faListCheck} /> Order-side payment state
          </strong>
          <p>Orders already carry basic payment status fields, but they are not a complete payments product yet.</p>
        </article>

        <article className="account-kpi">
          <span>What is missing</span>
          <strong>
            <FontAwesomeIcon icon={faCreditCard} /> Processor integration
          </strong>
          <p>No real gateway charge flow, payout ledger, dispute handling, or settlement reporting is live yet.</p>
        </article>

        <article className="account-kpi">
          <span>Why we paused it</span>
          <strong>
            <FontAwesomeIcon icon={faShieldHalved} /> Safer rollout
          </strong>
          <p>We’re keeping payments honest and unfinished here until onboarding, tenant boundaries, and operational rules are stronger.</p>
        </article>
      </div>

      <div className="account-grid">
        <section className="account-panel">
          <h2>What is already live</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>WhatsApp ordering</span>
              <strong>Live</strong>
            </div>
            <div className="account-list-row">
              <span>Restaurant order actions</span>
              <strong>Live</strong>
            </div>
            <div className="account-list-row">
              <span>Menu management</span>
              <strong>Live</strong>
            </div>
            <div className="account-list-row">
              <span>Restaurant settings</span>
              <strong>Live</strong>
            </div>
          </div>
        </section>

        <section className="account-panel">
          <h2>What payments still need</h2>
          <div className="account-list">
            <div className="account-list-row">
              <span>Gateway integration</span>
              <strong>Pending</strong>
            </div>
            <div className="account-list-row">
              <span>Receipt verification</span>
              <strong>Pending</strong>
            </div>
            <div className="account-list-row">
              <span>Payout/reconciliation flow</span>
              <strong>Pending</strong>
            </div>
            <div className="account-list-row">
              <span>Multi-restaurant billing model</span>
              <strong>Pending</strong>
            </div>
          </div>
        </section>

        <section className="account-panel full">
          <h2>Recommended order of work</h2>
          <div className="account-note">
            Finish the one-restaurant operational portal first, tighten staff and restaurant scoping,
            build onboarding, then come back to payments as its own proper implementation stream.
            That gives the payment layer a safer foundation instead of forcing it into a half-ready product surface.
          </div>
        </section>
      </div>
    </div>
  );
};

export default PaymentsPage;
