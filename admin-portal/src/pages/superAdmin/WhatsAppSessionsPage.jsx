import React, { useEffect, useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
// import { runtimeApi } from '../../api/runtime';
import { formatDateTime } from '../../utils/formatters';

const WhatsAppSessionsPage = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await runtimeApi.listSessions();
      setSessions(response);
    };

    load();
  }, []);

  const columns = [
    { key: 'restaurant', header: 'Restaurant' },
    { key: 'status', header: 'Session Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'connection', header: 'Connection', render: (row) => <StatusBadge value={row.connection} /> },
    { key: 'qrRequired', header: 'QR Required', render: (row) => (row.qrRequired ? 'Yes' : 'No') },
    { key: 'lastHeartbeat', header: 'Last Heartbeat', render: (row) => formatDateTime(row.lastHeartbeat) },
    { key: 'reconnectAttempts', header: 'Reconnect Attempts' },
  ];

  return (
    <div className="stack-md">
      <PageHeader
        title="WhatsApp Sessions"
        subtitle="Track connection quality, heartbeat health, and reconnect pressure."
      />
      <DataTable
        columns={columns}
        rows={sessions}
        emptyTitle="No session data"
        emptyDescription="WhatsApp session metrics will appear here once restaurants are onboarded."
      />
    </div>
  );
};

export default WhatsAppSessionsPage;