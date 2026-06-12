import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faStore, faSync, faSpinner,
  faCheckDouble, faCheck, faTimesCircle,
  faCommentDots, faExclamationTriangle, faRobot,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import adminApi from '../../api/admin';
import './RestaurantChatPage.css';

const PAGE_SIZE = 40;

const fmtTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
};

const fmtDay = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
};

const TickIcon = ({ status }) => {
  if (status === 'delivered') {
    return <FontAwesomeIcon icon={faCheckDouble} className="rcp-tick rcp-tick--delivered" />;
  }
  if (status === 'failed') {
    return <FontAwesomeIcon icon={faTimesCircle} className="rcp-tick rcp-tick--failed" />;
  }
  return <FontAwesomeIcon icon={faCheck} className="rcp-tick rcp-tick--sent" />;
};

const groupByDay = (messages) => {
  const groups = [];
  let currentDay = null;
  let currentGroup = null;

  messages.forEach((msg) => {
    const day = fmtDay(msg.time || msg.createdAt);
    if (day !== currentDay) {
      currentGroup = { day, messages: [] };
      groups.push(currentGroup);
      currentDay = day;
    }
    currentGroup.messages.push(msg);
  });

  return groups;
};

function normalizeThreadItem(item = {}, fallbackCustomerName = 'Customer') {
  const role = item.direction === 'in' ? 'user' : 'assistant';
  return {
    id: item.id,
    role,
    message: item.text || '',
    status: item.direction === 'out' ? 'delivered' : 'received',
    time: item.createdAtMs ? new Date(item.createdAtMs).toISOString() : item.createdAt,
    senderName: role === 'user' ? fallbackCustomerName : 'Servra AI',
    source: item.source || 'conversation',
  };
}

const RestaurantChatPage = () => {
  const { restaurantId, customerId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [beforeMs, setBeforeMs] = useState(0);
  const [meta, setMeta] = useState({
    restaurantName: state?.restaurantName || 'Restaurant',
    customerName: state?.customerName || '',
    customerPhone: state?.customerPhone || '',
  });

  const bottomRef = useRef(null);

  const restaurantName = meta.restaurantName || 'Restaurant';
  const recipient = meta.customerPhone || '';
  const customerName = meta.customerName || recipient || 'Customer';

  const loadThread = async ({ reset = false, cursor = 0 } = {}) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await adminApi.listOutboxCustomerMessages(restaurantId, customerId, {
        limit: PAGE_SIZE,
        beforeMs: cursor,
      });

      const mapped = (data.items || []).map((item) => normalizeThreadItem(item, customerName));
      setThread((prev) => {
        const nextThread = reset ? mapped : [...mapped, ...prev];
        const deduped = new Map();
        for (const item of nextThread) {
          const key = `${item.role}:${item.time}:${String(item.message || '').trim().toLowerCase()}`;
          if (!deduped.has(key)) {
            deduped.set(key, item);
          }
        }

        return Array.from(deduped.values()).sort(
          (left, right) => Number(new Date(left.time || 0)) - Number(new Date(right.time || 0))
        );
      });
      setHasMore(Boolean(data.hasMore));
      setBeforeMs(Number(data.nextBeforeMs || 0));
      setMeta({
        restaurantName: data.restaurant?.name || state?.restaurantName || 'Restaurant',
        customerName:
          data.customer?.label ||
          data.customer?.displayName ||
          state?.customerName ||
          data.customer?.customerPhone ||
          data.customer?.channelCustomerId ||
          'Customer',
        customerPhone:
          data.customer?.customerPhone ||
          data.customer?.channelCustomerId ||
          state?.customerPhone ||
          '',
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load chat thread');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadThread({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, customerId]);

  useEffect(() => {
    if (!autoRefresh) return undefined;

    const iv = setInterval(() => {
      loadThread({ reset: true });
    }, 8000);

    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, restaurantId, customerId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread]);

  const groups = useMemo(() => groupByDay(thread), [thread]);

  const stats = {
    total: thread.length,
    userMsgs: thread.filter((m) => m.role === 'user').length,
    botMsgs: thread.filter((m) => m.role === 'bot' || m.role === 'assistant').length,
    failed: thread.filter((m) => m.status === 'failed').length,
  };

  const loadOlder = async () => {
    if (!beforeMs || loadingMore) {
      return;
    }
    await loadThread({ cursor: beforeMs });
  };

  return (
    <div className="rcp-page">
      <div className="rcp-topbar">
        <button
          onClick={() => navigate(`/outbox/${restaurantId}/customers`, {
            state: { restaurantName, restaurantId },
          })}
          className="rcp-back-btn"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <div className="rcp-avatar">
          <FontAwesomeIcon icon={faStore} className="rcp-avatar-icon" />
        </div>

        <div className="rcp-topbar-info">
          <p className="rcp-topbar-name">{restaurantName}</p>
          <p className="rcp-topbar-sub">
            {recipient ? `${recipient} - ` : ''}{thread.length} messages
          </p>
        </div>

        <div className="rcp-topbar-actions">
          <button
            onClick={() => setAutoRefresh((a) => !a)}
            className={`rcp-topbar-btn${autoRefresh ? ' rcp-topbar-btn--active' : ''}`}
          >
            <FontAwesomeIcon icon={faSync} spin={autoRefresh} /> Live
          </button>
          <button onClick={() => loadThread({ reset: true })} className="rcp-topbar-btn">
            <FontAwesomeIcon icon={faSync} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rcp-error-banner">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="rcp-loader">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading conversation...
        </div>
      ) : thread.length === 0 ? (
        <div className="rcp-empty">
          <FontAwesomeIcon icon={faCommentDots} className="rcp-empty-icon" />
          <p className="rcp-empty-label">No messages yet for {customerName}</p>
          <p className="rcp-empty-label" style={{ fontSize: 13, opacity: 0.7 }}>
            New bot and customer messages appear here after the next WhatsApp exchange.
          </p>
        </div>
      ) : (
        <div className="rcp-chat-area">
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <button
                type="button"
                className="rcp-topbar-btn"
                onClick={loadOlder}
                disabled={loadingMore}
              >
                <FontAwesomeIcon icon={loadingMore ? faSpinner : faChevronUp} spin={loadingMore} />
                {loadingMore ? ' Loading older...' : ' Load older messages'}
              </button>
            </div>
          )}

          {groups.map((group) => (
            <React.Fragment key={group.day}>
              <div className="rcp-day-divider">
                <div className="rcp-day-divider-line" />
                <span className="rcp-day-divider-label">{group.day}</span>
                <div className="rcp-day-divider-line" />
              </div>

              {group.messages.map((msg) => {
                const isBot = msg.role === 'bot' || msg.role === 'assistant';
                const side = isBot ? 'bot' : 'user';

                return (
                  <div key={msg.id || `${msg.time}-${msg.message}`} className={`rcp-msg-row rcp-msg-row--${side}`}>
                    <div className={`rcp-bubble-wrap rcp-bubble-wrap--${side}`}>
                      <span className={`rcp-sender-label rcp-sender-label--${side}`}>
                        {isBot ? (
                          <>
                            <FontAwesomeIcon icon={faRobot} /> Servra AI
                          </>
                        ) : (
                          msg.senderName || customerName || recipient || 'Customer'
                        )}
                      </span>

                      <div className={`rcp-bubble rcp-bubble--${side}`}>
                        {msg.message || msg.content || msg.text}
                      </div>

                      <div className={`rcp-bubble-meta rcp-bubble-meta--${side}`}>
                        <span className="rcp-bubble-time">
                          {fmtTime(msg.time || msg.createdAt)}
                        </span>
                        {isBot && <TickIcon status={msg.status} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {!loading && thread.length > 0 && (
        <div className="rcp-stats-bar">
          <div className="rcp-stat-item">
            <span className="rcp-stat-item-label">Total</span>
            <span className="rcp-stat-item-value rcp-stat-item-value--white">{stats.total}</span>
          </div>
          <div className="rcp-stat-item">
            <span className="rcp-stat-item-label">Customer</span>
            <span className="rcp-stat-item-value rcp-stat-item-value--yellow">{stats.userMsgs}</span>
          </div>
          <div className="rcp-stat-item">
            <span className="rcp-stat-item-label">Bot</span>
            <span className="rcp-stat-item-value rcp-stat-item-value--green">{stats.botMsgs}</span>
          </div>
          {stats.failed > 0 && (
            <div className="rcp-stat-item">
              <span className="rcp-stat-item-label">Failed</span>
              <span className="rcp-stat-item-value rcp-stat-item-value--red">{stats.failed}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantChatPage;
