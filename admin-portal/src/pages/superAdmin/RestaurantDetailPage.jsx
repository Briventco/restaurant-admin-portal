import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { restaurantsApi } from '../../api/restaurants';
// import { runtimeApi } from '../../api/runtime';
// import { menuApi } from '../../api/menu';
// import { ordersApi } from '../../api/orders';
// import { paymentsApi } from '../../api/payments';
// import { deliveryZonesApi } from '../../api/deliveryZones';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';

const RestaurantDetailPage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [restaurantData, statusData, menuData, ordersData, paymentsData, deliveryData] = await Promise.all([
        restaurantsApi.getById(restaurantId),
        runtimeApi.getRestaurantWhatsAppStatus(restaurantId),
        menuApi.listByRestaurant(restaurantId),
        ordersApi.listByRestaurant(restaurantId),
        paymentsApi.listByRestaurant(restaurantId),
        deliveryZonesApi.listByRestaurant(restaurantId),
      ]);

      setRestaurant(restaurantData);
      setWhatsappStatus(statusData);
      setMenuItems(menuData.slice(0, 5));
      setRecentOrders(ordersData.slice(0, 5));
      setPayments(paymentsData.slice(0, 5));
      setDeliveryZones(deliveryData.slice(0, 5));
    };

    load();
  }, [restaurantId]);

  if (!restaurant) {
    return <div className="card">Loading restaurant details...</div>;
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title={`${restaurant.name} Detail`}
        subtitle="Restaurant profile, session state, and operational snapshots in one view."
      />

      <div className="card">
        <h3>{restaurant.name}</h3>
        <div className="inline-metadata">
          <span>ID: {restaurant.id}</span>
          <StatusBadge value={restaurant.status} />
          <StatusBadge value={restaurant.whatsappStatus} />
        </div>
      </div>

      <div className="cards-grid two-column">
        <div className="card">
          <h4>Bot / Session Status</h4>
          <p>Connection: <StatusBadge value={whatsappStatus?.connection} /></p>
          <p>Health: <StatusBadge value={whatsappStatus?.status} /></p>
          <p>QR Required: {whatsappStatus?.qrRequired ? 'Yes' : 'No'}</p>
          <p>Reconnect Attempts: {whatsappStatus?.reconnectAttempts ?? 0}</p>
        </div>

        <div className="card">
          <h4>Quick Menu Summary</h4>
          <ul className="list-reset">
            {menuItems.map((item) => (
              <li key={item.id}>{item.name} - ${item.price}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h4>Recent Orders</h4>
          <ul className="list-reset">
            {recentOrders.map((order) => (
              <li key={order.id}>{order.id} • {order.customer} • <StatusBadge value={order.status} /></li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h4>Payment Config Summary</h4>
          <p>Tracked Payment Records: {payments.length}</p>
          <p>Last Known Statuses:</p>
          <ul className="list-reset">
            {payments.map((payment) => (
              <li key={payment.id}>{payment.orderId} • <StatusBadge value={payment.status} /></li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h4>Delivery Config Summary</h4>
          <p>Zones Configured: {deliveryZones.length}</p>
          <ul className="list-reset">
            {deliveryZones.map((zone) => (
              <li key={zone.id}>{zone.name} • Fee ${zone.fee} • {zone.active ? 'Active' : 'Inactive'}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;