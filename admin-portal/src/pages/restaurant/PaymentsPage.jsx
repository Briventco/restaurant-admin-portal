import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import { paymentsApi } from '../../api/payments';
import { formatCurrency } from '../../utils/formatters';

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);

  const load = async () => {
    const response = await paymentsApi.listByRestaurant(user.restaurantId);
    setPayments(response);
  };

  useEffect(() => {
    let active = true;
    paymentsApi.listByRestaurant(user.restaurantId).then((response) => {
      if (active) {
        setPayments(response);
      }
    });

    return () => {
      active = false;
    };
  }, [user.restaurantId]);

  const updateStatus = async (payment, status) => {
    await paymentsApi.updateStatus(user.restaurantId, payment.id, status);
    load();
  };

  const columns = [
    { key: 'orderId', header: 'Order' },
    { key: 'customer', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'receiptState', header: 'Receipt State', render: (row) => <StatusBadge value={row.receiptState} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="actions-row">
          <button type="button" className="button button-ghost button-sm" onClick={() => updateStatus(row, 'confirmed')}>
            Confirm Payment
          </button>
          <button type="button" className="button button-ghost button-sm" onClick={() => updateStatus(row, 'rejected')}>
            Reject Payment
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="stack-md">
      <PageHeader
        title="Payments"
        subtitle="Review submitted receipts and confirm or reject payment states."
      />
      <DataTable
        columns={columns}
        rows={payments}
        emptyTitle="No payment records"
        emptyDescription="Payment submissions and review actions will appear here."
      />
    </div>
  );
};

export default PaymentsPage;
