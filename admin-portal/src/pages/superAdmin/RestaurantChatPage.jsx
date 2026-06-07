import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faStore, faSync, faSpinner,
  faCheckDouble, faCheck, faTimesCircle,
  faCommentDots, faExclamationTriangle, faRobot,
} from '@fortawesome/free-solid-svg-icons';
import { restaurantsChatApi } from '../../api/restaurantsChat';
import './RestaurantChatPage.css';

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
  if (status === 'delivered') return <FontAwesomeIcon icon={faCheckDouble} className="rcp-tick rcp-tick--delivered" />;
  if (status === 'failed')    return <FontAwesomeIcon icon={faTimesCircle} className="rcp-tick rcp-tick--failed"    />;
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

const RestaurantChatPage = () => {
  const { restaurantId } = useParams();
  const { state }        = useLocation();
  const navigate         = useNavigate();

  const [thread, setThread]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [useMock, setUseMock]       = useState(true);

  const bottomRef = useRef(null);

  const restaurantName = state?.restaurantName || 'Aivot Treats';
  const recipient      = state?.recipient      || '+234 812 345 6789';
  const customerName = state?.customerName || recipient?.split(' ')[0] || 'Customer';

  const load = async () => {
    setLoading(true);
    try {
      const data = await restaurantsChatApi.getChatThread(restaurantId, customerName, recipient, useMock);
      setThread(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load chat thread');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [restaurantId, useMock]);

  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, [autoRefresh, restaurantId, useMock]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread]);

  const groups = groupByDay(thread);

  const stats = {
    total:     thread.length,
    userMsgs:  thread.filter((m) => m.role === 'user').length,
    botMsgs:   thread.filter((m) => m.role === 'bot' || m.role === 'assistant').length,
    failed:    thread.filter((m) => m.status === 'failed').length,
  };

  return (
    <div className="rcp-page">
      <div className="rcp-topbar">
        <button onClick={() => navigate(-1)} className="rcp-back-btn">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <div className="rcp-avatar">
          <FontAwesomeIcon icon={faStore} className="rcp-avatar-icon" />
        </div>

        <div className="rcp-topbar-info">
          <p className="rcp-topbar-name">{restaurantName}</p>
          <p className="rcp-topbar-sub">
            {recipient ? `${recipient} · ` : ''}{thread.length} messages
          </p>
        </div>

        <div className="rcp-topbar-actions">
          <button
            onClick={() => setUseMock(!useMock)}
            className="rcp-topbar-btn"
            style={{ backgroundColor: useMock ? '#4c9aff' : '#2a2f3e' }}
          >
            {useMock ? 'Mock ON' : 'Mock OFF'}
          </button>
          <button
            onClick={() => setAutoRefresh((a) => !a)}
            className={`rcp-topbar-btn${autoRefresh ? ' rcp-topbar-btn--active' : ''}`}
          >
            <FontAwesomeIcon icon={faSync} spin={autoRefresh} /> Live
          </button>
          <button onClick={load} className="rcp-topbar-btn">
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
          <FontAwesomeIcon icon={faSpinner} spin /> Loading conversation…
        </div>
      ) : thread.length === 0 ? (
        <div className="rcp-empty">
          <FontAwesomeIcon icon={faCommentDots} className="rcp-empty-icon" />
          <p className="rcp-empty-label">No messages found for this restaurant</p>
        </div>
      ) : (
        <div className="rcp-chat-area">
          {groups.map((group) => (
            <React.Fragment key={group.day}>
              <div className="rcp-day-divider">
                <div className="rcp-day-divider-line" />
                <span className="rcp-day-divider-label">{group.day}</span>
                <div className="rcp-day-divider-line" />
              </div>

              {group.messages.map((msg) => {
                const isBot = msg.role === 'bot' || msg.role === 'assistant';
                const side  = isBot ? 'bot' : 'user';

                return (
                  <div key={msg.id || msg._id} className={`rcp-msg-row rcp-msg-row--${side}`}>
                    <div className={`rcp-bubble-wrap rcp-bubble-wrap--${side}`}>
                      <span className={`rcp-sender-label rcp-sender-label--${side}`}>
                        {isBot ? (
                          <><FontAwesomeIcon icon={faRobot} /> Servra AI</>
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