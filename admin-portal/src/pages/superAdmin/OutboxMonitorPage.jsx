import React, { useEffect, useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
// import { outboxApi } from '../../api/outbox';

const OutboxMonitorPage = () => {
  const [messages, setMessages] = useState([]);

  const load = async () => {
    const response = await outboxApi.list();
    setMessages(response);
  };

  useEffect(() => {
    let active = true;
    outboxApi.list().then((response) => {
      if (active) {
        setMessages(response);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const retryMessage = async (messageId) => {
    await outboxApi.retryMessage(messageId);
    load();
  };

  const columns = [
    { key: 'messageId', header: 'Message ID' },
    { key: 'restaurant', header: 'Restaurant' },
    { key: 'recipient', header: 'Recipient' },
    { key: 'messageType', header: 'Type' },
    { key: 'lifecycle', header: 'Lifecycle', render: (row) => <StatusBadge value={row.lifecycle} /> },
    { key: 'attempts', header: 'Attempts' },
    { key: 'lastError', header: 'Last Error' },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          className="button button-ghost button-sm"
          onClick={() => retryMessage(row.messageId)}
        >
          Retry
        </button>
      ),
    },
  ];

  return (
    <div className="stack-md">
      <PageHeader
        title="Outbox Monitor"
        subtitle="Inspect message lifecycle failures and trigger retries."
      />
      <DataTable
        columns={columns}
        rows={messages}
        rowKey="messageId"
        emptyTitle="No outbox messages"
        emptyDescription="Outbox lifecycle events will show up once message traffic starts."
      />
    </div>
  );
};

export default OutboxMonitorPage;