import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhatsAppChat } from '../../hooks/useWhatsAppChat';
import PhoneMock from '../../components/PhoneMock';
import { WHATSAPP_URL, navItems, stepsData, featuresList, statsData } from '../../data/landingPageData';
import heroBg from '/images/img1.jpg';
import aboutImg from '/images/img3.jpg';
import logoImg from '/images/img2.jpg';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);

  const {
    chatMessages, inputMessage, setInputMessage,
    botTyping, orderStep, chatEndRef,
    handleSendMessage, handleKeyPress, getStatusText,
  } = useWhatsAppChat();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 20);
      const sections = ['home', 'about', 'how-it-works'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveNavItem(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || loading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen, loading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="lp-app">
      <AnimatePresence>
        {loading && (
          <motion.div
            className="lp-preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <motion.div
              className="lp-preloader__content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.img
                src={logoImg}
                alt="Servra"
                className="lp-preloader__logo"
              />
              <motion.p
                className="lp-preloader__name"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Servra
              </motion.p>
              <motion.p
                className="lp-preloader__version"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Version 1.0
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className={`lp-nav ${isNavScrolled ? 'lp-nav--scrolled' : ''}`} ref={menuRef}>
        <div className="lp-nav__container">
          <div className="lp-nav__logo">
            <img src={logoImg} alt="Servra" className="lp-nav__logo-img" />
            Ser<span className="lp-nav__logo-accent">vra</span>
          </div>
          <div className="lp-nav__right">
            <div className="lp-nav__links">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`lp-nav__link ${activeNavItem === item.id ? 'lp-nav__link--active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/restaurant-signup')} className="lp-btn lp-btn--primary lp-nav__cta">
              Get Started <FontAwesomeIcon icon={faArrowRight} className="lp-icon--sm" />
            </button>
            <button onClick={() => navigate('/restaurant-signup')} className="lp-btn lp-btn--ghost lp-nav__secondary">
              For Restaurants
            </button>
            <button
              className="lp-nav__hamburger"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>

        <div className={`lp-nav__mobile ${mobileMenuOpen ? 'lp-nav__mobile--open' : ''}`}>
          <div className="lp-nav__mobile-inner">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`lp-nav__mobile-link ${activeNavItem === item.id ? 'lp-nav__mobile-link--active' : ''}`}
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => { navigate('/restaurant-signup'); setMobileMenuOpen(false); }} className="lp-btn lp-btn--primary lp-btn--full">
              Get Started <FontAwesomeIcon icon={faArrowRight} className="lp-icon--sm" />
            </button>
            <button onClick={() => { navigate('/restaurant-signup'); setMobileMenuOpen(false); }} className="lp-btn lp-btn--ghost lp-btn--full">
              For Restaurants
            </button>
          </div>
        </div>
      </nav>

      <section id="home" className="lp-hero">
        <img src={heroBg} alt="" className="lp-hero__bg" aria-hidden="true" />
        <div className="lp-hero__overlay" />
        <div className="lp-hero__container">
          <div className="lp-hero__left">
            <div className="lp-badge">
              <FontAwesomeIcon icon={faWhatsapp} className="lp-badge__icon" />
              <span>WhatsApp-powered food ordering</span>
            </div>
            <h1 className="lp-hero__title">
              Order Food Faster<br />
              <span className="lp-hero__title-accent">on WhatsApp</span>
            </h1>
            <p className="lp-hero__desc">
              Just chat on WhatsApp to browse the menu, place orders, and get delivery updates — instantly. No apps, no accounts, no stress.
            </p>
            <div className="lp-hero__buttons">
              <button onClick={() => navigate('/restaurant-signup')} className="lp-btn lp-btn--restaurant">
                Bring your restaurant online
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="lp-btn lp-btn--outline">
                See how it works <FontAwesomeIcon icon={faArrowRight} className="lp-icon--xs" />
              </button>
            </div>
            <div className="lp-stats">
              {statsData.map((stat) => (
                <div key={stat.label} className="lp-stats__item">
                  <p className="lp-stats__value">{stat.value}</p>
                  <p className="lp-stats__label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-hero__right">
            <PhoneMock
              chatMessages={chatMessages}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              botTyping={botTyping}
              orderStep={orderStep}
              chatEndRef={chatEndRef}
              handleSendMessage={handleSendMessage}
              handleKeyPress={handleKeyPress}
              getStatusText={getStatusText}
            />
          </div>
        </div>
      </section>

      <section id="about" className="lp-about">
        <div className="lp-about__container">
          <div className="lp-about__image-wrapper">
            <img src={aboutImg} alt="About Servra" className="lp-about__image" />
          </div>
          <div className="lp-about__right">
            <p className="lp-tag">About</p>
            <h2 className="lp-heading">No app. No signup.<br />Just WhatsApp.</h2>
            <p className="lp-about__text">
              Servra is a WhatsApp-powered food ordering system built for restaurants and vendors across Nigeria. You chat with it exactly the way you'd chat with a friend — send a message, pick your food, confirm your address, and get it delivered.
            </p>
            <p className="lp-about__text">
              No apps to download. No accounts to create. No long forms to fill. Just the phone you already have and WhatsApp you already use every single day.
            </p>
          </div>
        </div>

        <div className="lp-features">
          {featuresList.map((feature, idx) => (
            <motion.div
              key={idx}
              className="lp-features__card"
              onMouseEnter={() => setHoveredFeature(idx)}
              onMouseLeave={() => setHoveredFeature(null)}
              animate={{
                borderColor: hoveredFeature === idx ? '#22c55e' : '#1e1e1e',
                boxShadow: hoveredFeature === idx ? '0 0 30px rgba(34,197,94,0.2)' : 'none',
                scale: hoveredFeature === idx ? 1.02 : 1,
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <AnimatePresence mode="wait">
                {hoveredFeature === idx ? (
                  <motion.div
                    key="back"
                    className="lp-features__back"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="lp-features__icon">
                      <FontAwesomeIcon icon={feature.icon} />
                    </div>
                    <p className="lp-features__back-title">{feature.title}</p>
                    <p className="lp-features__back-text">{feature.description}</p>
                    <span className="lp-features__back-cta">Tap to learn more →</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="front"
                    className="lp-features__front"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="lp-features__icon">
                      <FontAwesomeIcon icon={feature.icon} />
                    </div>
                    <p className="lp-features__title">{feature.title}</p>
                    <p className="lp-features__desc">{feature.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="lp-steps">
        <div className="lp-steps__container">
          <div className="lp-steps__header">
            <p className="lp-tag">How It Works</p>
            <h2 className="lp-heading">Four steps. That's it.</h2>
            <p className="lp-steps__sub">
              From opening WhatsApp to getting your food delivered — the entire experience is designed to be effortless.
            </p>
          </div>
          <div className="lp-steps__grid">
            {stepsData.map((step, idx) => (
              <div key={idx} className="lp-steps__card">
                <div className="lp-steps__card-top">
                  <div className="lp-steps__icon">
                    <FontAwesomeIcon icon={step.icon} />
                  </div>
                  <span className="lp-steps__num">{step.number}</span>
                </div>
                <p className="lp-steps__title">{step.title}</p>
                <p className="lp-steps__desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-cta">
        <div className="lp-cta__container">
          <div className="lp-cta__icon">
            <FontAwesomeIcon icon={faWhatsapp} />
          </div>
          <h2 className="lp-cta__title">Ready to order?</h2>
          <p className="lp-cta__text">
            Open WhatsApp and start chatting with Servra. Your first meal is just one message away.
          </p>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="lp-btn lp-btn--wa-lg">
            <FontAwesomeIcon icon={faWhatsapp} className="lp-icon--md" />
            Start Ordering Now
          </a>
          <p className="lp-cta__note">No download · No signup · Works on any phone</p>
        </div>
      </section>

      <footer className="lp-footer">
        <p>© {new Date().getFullYear()} Servra · WhatsApp-powered food ordering</p>
      </footer>
    </div>
  );
};

export default LandingPage;