
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faPaperPlane, faCircle, faClock, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

const PhoneMock = ({
  chatMessages, inputMessage, setInputMessage,
  botTyping, orderStep, chatEndRef,
  handleSendMessage, handleKeyPress, getStatusText
}) => {
  const getStatusIcon = () => {
    if (botTyping) return faClock;
    if (orderStep !== 'idle') return faCheckDouble;
    return faCircle;
  };

  const getStatusColor = () => {
    if (botTyping) return '#f59e0b';
    if (orderStep !== 'idle') return '#22c55e';
    return '#22c55e';
  };

  return (
    <div className="phone-mock">
      <div className="phone-mock-header">
        <div className="phone-avatar">
          <FontAwesomeIcon icon={faUtensils} />
        </div>
        <div className="phone-info">
          <p className="phone-name">Servra</p>
          <div className="phone-status-wrapper">
            <FontAwesomeIcon
              icon={getStatusIcon()}
              className="status-icon"
              style={{ color: getStatusColor(), fontSize: '10px' }}
            />
            <p className="phone-status">{getStatusText()}</p>
          </div>
        </div>
      </div>

      <div className="phone-mock-chat">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble-wrapper ${msg.sender}`}>
            <div className={`chat-bubble ${msg.sender}`}>
              <p className="message-text">{msg.text}</p>
            </div>
          </div>
        ))}
        {botTyping && (
          <div className="chat-bubble-wrapper bot">
            <div className="chat-bubble bot typing-indicator">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="phone-mock-footer">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message…"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="send-button" onClick={handleSendMessage}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
};

export default PhoneMock;