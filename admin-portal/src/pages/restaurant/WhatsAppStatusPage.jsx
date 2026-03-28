
import React, { useEffect, useState } from 'react';
// import { useAuth } from '../../auth/AuthContext';
// import { runtimeApi } from '../../api/runtime';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import { formatDateTime } from '../../utils/formatters';

const WhatsAppStatusPage = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let active = true;
    runtimeApi.getRestaurantWhatsAppStatus(user.restaurantId).then((response) => {
      if (active) {
        setStatus(response);
      }
    });

    return () => {
      active = false;
    };
  }, [user.restaurantId]);

  if (!status) {
    return <div className="card">Loading WhatsApp status...</div>;
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="WhatsApp Runtime Status"
        subtitle="Monitor connection health and trigger recovery placeholders."
      />

      <div className="cards-grid two-column">
        <div className="card">
          <h3>Connection</h3>
          <p><StatusBadge value={status.connection} /></p>
          <p>Session health: <StatusBadge value={status.status} /></p>
          <p>QR required: {status.qrRequired ? 'Yes' : 'No'}</p>
          <p>Last activity: {formatDateTime(status.lastHeartbeat)}</p>
          <p>Reconnect attempts: {status.reconnectAttempts}</p>
        </div>

        <div className="card">
          <h3>Session Actions (Placeholder)</h3>
          <div className="actions-row wrap">
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setActionMessage('Reconnect action queued (mock).')}
            >
              Reconnect
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setActionMessage('Restart session action queued (mock).')}
            >
              Restart Session
            </button>
          </div>

          {actionMessage ? <p className="muted-text">{actionMessage}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppStatusPage;
