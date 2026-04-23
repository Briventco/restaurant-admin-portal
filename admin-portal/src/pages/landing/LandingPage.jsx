import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faTimes, faArrowRight, faCommentDots,
  faListUl, faCheckCircle, faTruck, faBolt,
  faMobileAlt, faShieldAlt, faHeadset, faUtensils, faPaperPlane,
  faCircle, faClock, faCheckDouble
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import './LandingPage.css';

const WHATSAPP_NUMBER = '2349133867929';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi!%20I%20want%20to%20order%20food`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [botTyping, setBotTyping] = useState(false);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi! Welcome to Servra 👋\nReply MENU to see what\'s available today.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [orderStep, setOrderStep] = useState('idle');
  const [selectedItem, setSelectedItem] = useState(null);
  const chatEndRef = useRef(null);

  const menuItems = {
    '1': { name: 'Jollof Rice', price: 2500 },
    '2': { name: 'Grilled Chicken', price: 3500 },
    '3': { name: 'Beef Burger', price: 2000 }
  };

  const menuText = `🍛 1. Jollof Rice — ₦2,500\n🍗 2. Grilled Chicken — ₦3,500\n🍔 3. Beef Burger — ₦2,000\n\nReply with item number (1, 2, or 3) to order.`;

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text) => {
    setBotTyping(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'bot', text: text }]);
      setBotTyping(false);
    }, 800);
  };

  const addUserMessage = (text) => {
    setChatMessages(prev => [...prev, { sender: 'user', text: text }]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    addUserMessage(userMsg);
    setInputMessage('');

    setTimeout(() => {
      processUserMessage(userMsg);
    }, 300);
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
    } 
    else if (orderStep === 'waitingForItem') {
      if (menuItems[msg]) {
        const item = menuItems[msg];
        setSelectedItem(item);
        addBotMessage(`✅ ${item.name} added! (₦${item.price.toLocaleString()})\n\nSend your delivery address to confirm your order.`);
        setOrderStep('waitingForAddress');
      } else {
        addBotMessage('Please reply with a valid item number (1, 2, or 3) to order.');
      }
    }
    else if (orderStep === 'waitingForAddress') {
      addBotMessage(`📍 Order confirmed!\n\nItem: ${selectedItem.name}\nPrice: ₦${selectedItem.price.toLocaleString()}\nAddress: ${msg}\n\nYour food will be delivered in 30-45 mins. Thank you for ordering with Servra! 🚀\n\nType MENU to order again.`);
      setOrderStep('idle');
      setSelectedItem(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'how-it-works', label: 'How It Works' },
  ];

  const stepsData = [
    { icon: faWhatsapp, number: '01', title: 'Open WhatsApp', description: 'Click the button and it opens your WhatsApp app automatically — no download needed.' },
    { icon: faCommentDots, number: '02', title: 'Send a message', description: 'Say "Hi" or "Menu" and Servra responds to you instantly.' },
    { icon: faListUl, number: '03', title: 'Choose your food', description: 'Browse the menu right inside the chat and reply with what you want to order.' },
    { icon: faTruck, number: '04', title: 'Get it delivered', description: 'Confirm your address and receive real-time delivery updates directly in your chat.' },
  ];

  const featuresList = [
    { icon: faMobileAlt, title: 'No app download', description: 'Works directly inside WhatsApp. Nothing extra to install on your phone.' },
    { icon: faBolt, title: 'Instant ordering', description: 'Place a complete order in under 60 seconds through simple chat replies.' },
    { icon: faCheckCircle, title: 'Fast confirmation', description: 'Get your order confirmed by the restaurant immediately after you send it.' },
    { icon: faShieldAlt, title: 'Real-time updates', description: 'Every delivery status update is sent straight to your WhatsApp chat.' },
    { icon: faWhatsapp, title: '100% WhatsApp-based', description: 'The entire ordering experience lives inside the app you already use every day.' },
    { icon: faHeadset, title: 'Works on any phone', description: 'No smartphone requirements. If you have WhatsApp, you can use Servra.' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 20);
      
      const sections = ['home', 'about', 'how-it-works'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveNavItem(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Get dynamic status text based on order step
  const getStatusText = () => {
    if (botTyping) return 'Typing...';
    if (orderStep === 'waitingForItem') return 'Ready to take your order';
    if (orderStep === 'waitingForAddress') return 'Waiting for address';
    if (chatMessages.length > 3) return 'Online · Usually replies instantly';
    return 'Online · Ready to help';
  };

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
    <div className="app">
      {/* Navigation */}
      <nav className={`navbar ${isNavScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="logo">
            Ser<span className="logo-accent">vra</span>
          </div>

          <div className="navbar-right">
            <div className="nav-links">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`nav-link ${activeNavItem === item.id ? 'nav-link-active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button onClick={() => navigate('/login')} className="btn-primary desktop-get-started">
              Get Started <FontAwesomeIcon icon={faArrowRight} className="icon-small" />
            </button>

            <button onClick={() => navigate('/restaurant-signup')} className="btn-nav-secondary">
              For Restaurants
            </button>

            <button 
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>

        <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <div className="mobile-menu-links">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`mobile-nav-link ${activeNavItem === item.id ? 'mobile-nav-link-active' : ''}`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => navigate('/login')} className="mobile-get-started-btn">
              Get Started <FontAwesomeIcon icon={faArrowRight} className="icon-small" />
            </button>
            <button onClick={() => navigate('/restaurant-signup')} className="mobile-secondary-btn">
              For Restaurants
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-container">
          <div className="hero-left">
            <div className="badge">
              <FontAwesomeIcon icon={faWhatsapp} className="badge-icon" />
              <span>WhatsApp-powered food ordering</span>
            </div>

            <h1 className="hero-title">
              Order Food Faster<br />
              <span className="hero-title-highlight">on WhatsApp</span>
            </h1>

            <p className="hero-description">
              Just chat on WhatsApp to browse the menu, place orders, and get delivery updates — instantly. No apps, no accounts, no stress.
            </p>

            <div className="hero-buttons">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-whatsapp">
                <FontAwesomeIcon icon={faWhatsapp} className="icon-medium" />
                Start Ordering
              </a>

              <button onClick={() => scrollToSection('how-it-works')} className="btn-outline">
                See how it works <FontAwesomeIcon icon={faArrowRight} className="icon-tiny" />
              </button>

              <button onClick={() => navigate('/restaurant-signup')} className="btn-restaurant">
                Bring your restaurant online
              </button>
            </div>

            <div className="stats">
              {[
                ['100%', 'WhatsApp based'],
                ['0', 'App downloads'],
                ['60s', 'To place an order']
              ].map(([value, label]) => (
                <div key={label} className="stat-item">
                  <p className="stat-number">{value}</p>
                  <p className="stat-label">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right">
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
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="about-container">
          <div className="about-content">
            <p className="section-tag">About</p>
            <h2 className="section-heading">
              No app. No signup.<br />Just WhatsApp.
            </h2>
            <p className="about-text">
              Servra is a WhatsApp-powered food ordering system built for restaurants and vendors across Nigeria. You chat with it exactly the way you'd chat with a friend — send a message, pick your food, confirm your address, and get it delivered.
            </p>
            <p className="about-text">
              No apps to download. No accounts to create. No long forms to fill. Just the phone you already have and WhatsApp you already use every single day.
            </p>
          </div>

          <div className="features-grid">
            {featuresList.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon-wrapper">
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <p className="feature-title">{feature.title}</p>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="steps">
        <div className="steps-container">
          <div className="steps-header">
            <p className="section-tag">How It Works</p>
            <h2 className="section-heading">Four steps. That's it.</h2>
            <p className="steps-subheading">
              From opening WhatsApp to getting your food delivered — the entire experience is designed to be effortless.
            </p>
          </div>

          <div className="steps-grid">
            {stepsData.map((step, idx) => (
              <div key={idx} className="step-card">
                <div className="step-card-header">
                  <div className="step-icon">
                    <FontAwesomeIcon icon={step.icon} />
                  </div>
                  <span className="step-number">{step.number}</span>
                </div>
                <p className="step-title">{step.title}</p>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <div className="cta-icon-wrapper">
            <FontAwesomeIcon icon={faWhatsapp} />
          </div>
          <h2 className="cta-title">Ready to order?</h2>
          <p className="cta-text">
            Open WhatsApp and start chatting with Servra. Your first meal is just one message away.
          </p>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-whatsapp-large">
            <FontAwesomeIcon icon={faWhatsapp} className="icon-medium" />
            Start Ordering Now
          </a>
          <p className="cta-footer-note">No download · No signup · Works on any phone</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Servra · WhatsApp-powered food ordering</p>
      </footer>
    </div>
  );
};

export default LandingPage;
