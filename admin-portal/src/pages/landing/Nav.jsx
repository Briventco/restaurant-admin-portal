import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '../../data/landingPageData';
import logoImg from '/images/brand size-05.png';
import './LandingPage.css';

const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('home');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 20);
      if (!isHome) return;
      const sections = ['home', 'about', 'how-it-works', 'pricing', 'faq'];
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) { setActiveNavItem(section); break; }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const goToSection = (id) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`lp-nav ${isNavScrolled ? 'lp-nav--scrolled' : ''}`} ref={menuRef}>
      <div className="lp-nav__container">
        <div className="lp-nav__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logoImg} alt="Servra" className="lp-nav__logo-img" />
        </div>
        <div className="lp-nav__right">
          <div className="lp-nav__links">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => goToSection(item.id)}
                className={`lp-nav__link ${isHome && activeNavItem === item.id ? 'lp-nav__link--active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/waitlist')} className="lp-btn lp-btn--primary lp-nav__cta">
            Join Waitlist
          </button>
          <button className="lp-nav__hamburger" onClick={() => setMobileMenuOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={mobileMenuOpen}>
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div className="lp-nav__mobile" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
            <div className="lp-nav__mobile-inner">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => goToSection(item.id)}
                  className={`lp-nav__mobile-link ${isHome && activeNavItem === item.id ? 'lp-nav__mobile-link--active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
              <button onClick={() => { navigate('/waitlist'); setMobileMenuOpen(false); }} className="lp-btn lp-btn--primary lp-btn--full">
                Join Waitlist
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Nav;
