import { useState, useRef, useEffect } from 'react';
import { menuItems, menuText } from '../data/landingPageData';

export const useWhatsAppChat = () => {
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi! Welcome to Servra 👋\nReply MENU to see what\'s available today.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [orderStep, setOrderStep] = useState('idle');
  const [selectedItem, setSelectedItem] = useState(null);
  const [botTyping, setBotTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addBotMessage = (text) => {
    setBotTyping(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'bot', text }]);
      setBotTyping(false);
    }, 800);
  };

  const addUserMessage = (text) => {
    setChatMessages(prev => [...prev, { sender: 'user', text }]);
  };

  const processUserMessage = (msg) => {
    const lowerMsg = msg.toLowerCase();

    if (orderStep === 'idle') {
      if (lowerMsg === 'menu' || lowerMsg === 'hi' || lowerMsg === 'hello') {
        addBotMessage(menuText);
        setOrderStep('waitingForItem');
      } else {
        addBotMessage('Reply with "MENU" to see what we have available today! 🍽️');
      }
    } else if (orderStep === 'waitingForItem') {
      if (menuItems[msg]) {
        const item = menuItems[msg];
        setSelectedItem(item);
        addBotMessage(`✅ ${item.name} added! (₦${item.price.toLocaleString()})\n\nSend your delivery address to confirm your order.`);
        setOrderStep('waitingForAddress');
      } else {
        addBotMessage('Please reply with a valid item number (1, 2, or 3) to order.');
      }
    } else if (orderStep === 'waitingForAddress') {
      addBotMessage(`📍 Order confirmed!\n\nItem: ${selectedItem.name}\nPrice: ₦${selectedItem.price.toLocaleString()}\nAddress: ${msg}\n\nYour food will be delivered in 30-45 mins. Thank you for ordering with Servra! 🚀\n\nType MENU to order again.`);
      setOrderStep('idle');
      setSelectedItem(null);
    }
  };
// Just to handle message 
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage.trim();
    addUserMessage(userMsg);
    setInputMessage('');
    setTimeout(() => processUserMessage(userMsg), 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const getStatusText = () => {
    if (botTyping) return 'Typing...';
    if (orderStep === 'waitingForItem') return 'Ready to take your order';
    if (orderStep === 'waitingForAddress') return 'Waiting for address';
    if (chatMessages.length > 3) return 'Online · Usually replies instantly';
    return 'Online · Ready to help';
  };

  return {
    chatMessages, inputMessage, setInputMessage,
    orderStep, selectedItem, botTyping,
    chatEndRef, handleSendMessage, handleKeyPress,
    getStatusText
  };
};