import React from 'react';
import { titleFromSnake } from '../../utils/formatters';

const normalize = (value) => (value || '').toString().trim().toLowerCase().replace(/\s+/g, '_');

const getToneClass = (value) => {
  const normalized = normalize(value);

  if (['active', 'connected', 'confirmed', 'delivered', 'healthy', 'sent'].includes(normalized)) {
    return 'badge-success';
  }

  if (
    [
      'pending_staff_review',
      'awaiting_customer_update',
      'awaiting_customer_address',
      'awaiting_payment',
      'not_requested',
      'qr_required',
      'warning',
    ].includes(normalized)
  ) {
    return 'badge-warning';
  }

  if (['cancelled', 'rejected', 'disconnected', 'failed', 'suspended', 'disabled'].includes(normalized)) {
    return 'badge-danger';
  }

  if (['payment_under_review', 'under_review', 'preparing', 'out_for_delivery', 'retrying', 'reconnecting', 'degraded'].includes(normalized)) {
    return 'badge-info';
  }

  return 'badge-neutral';
};

const StatusBadge = ({ value, label }) => {
  const resolvedLabel = label || titleFromSnake(normalize(value));
  return <span className={`badge ${getToneClass(value)}`}>{resolvedLabel}</span>;
};

export default StatusBadge;