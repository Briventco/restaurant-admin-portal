import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faArrowRight, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useWhatsAppChat } from '../../hooks/useWhatsAppChat';
import PhoneMock from '../../components/PhoneMock';
import Footer from './Footer';
import { navItems, stepsData, featuresList, statsData, faqData, marqueeItems } from '../../data/landingPageData';
import logoImg from '/images/brand size-05.png';
import aboutImg from '/images/img3.jpg';
import heroBg1 from '/images/img1.jpg';
import './LandingPage.css';

const slideContent = [
  {
    badge: 'For restaurants & food vendors',
    title: <>Turn Your WhatsApp Into an<br /><span className="lp-hero__title-accent">Order-Taking Machine</span></>,
    desc: 'Let customers order from you automatically via WhatsApp — no apps, no extra staff, no missed orders. Servra handles everything while you focus on making great food.',
    type: 'image',
    bg: heroBg1,
  },
  {
    badge: 'Zero missed orders',
    title: <>Your Restaurant.<br /><span className="lp-hero__title-accent">Running 24/7.</span></>,
    desc: 'Servra automates your entire order flow on WhatsApp. Customers browse, order, and confirm — all without you lifting a finger. Sleep easy knowing every sale is captured.',
    type: 'wave',
  },
  {
    badge: 'Built for Nigerian restaurants',
    title: <>More Orders.<br /><span className="lp-hero__title-accent">Less Stress.</span></>,
    desc: 'From a single food vendor to a multi-branch restaurant — Servra scales with you. One WhatsApp number, unlimited potential. Join the waitlist today.',
    type: 'sphere',
  },
];

const WaveCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 2.5, 7);
    camera.lookAt(0, 0, 0);
    const resize = () => {
      const w = canvas.parentElement?.offsetWidth || window.innerWidth;
      const h = canvas.parentElement?.offsetHeight || 600;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);
    const COLS = 48, ROWS = 48;
    const geo = new THREE.PlaneGeometry(14, 14, COLS - 1, ROWS - 1);
    geo.rotateX(-Math.PI / 2.8);
    const mat = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true, transparent: true, opacity: 0.13 });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const posAttr = geo.attributes.position;
    const origY = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) origY[i] = posAttr.getY(i);
    let mouseX = 0;
    const onMouse = (e) => { mouseX = (e.clientX / window.innerWidth - 0.5) * 2; };
    window.addEventListener('mousemove', onMouse);
    let animId, t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.012;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        posAttr.setY(i, origY[i] + Math.sin(x * 0.5 + t) * 0.35 + Math.cos(z * 0.4 + t * 0.8) * 0.25);
      }
      posAttr.needsUpdate = true;
      mesh.rotation.y += (mouseX * 0.04 - mesh.rotation.y) * 0.03;
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      renderer.dispose();
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
};

const SphereCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);
    const resize = () => {
      const w = canvas.parentElement?.offsetWidth || window.innerWidth;
      const h = canvas.parentElement?.offsetHeight || 600;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);
    const group = new THREE.Group();
    scene.add(group);
    const sphereGeo = new THREE.SphereGeometry(1.8, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, wireframe: true, transparent: true, opacity: 0.08 });
    group.add(new THREE.Mesh(sphereGeo, sphereMat));
    const COUNT = 120;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 0.4;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const ptMat = new THREE.PointsMaterial({ color: 0x4ade80, size: 0.04, transparent: true, opacity: 0.7 });
    group.add(new THREE.Points(ptGeo, ptMat));
    const ringGeo = new THREE.TorusGeometry(2.4, 0.004, 2, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.15 });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    group.add(ring1);
    const ring2 = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 5;
    group.add(ring2);
    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5);
      mouseY = (e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouse);
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.003;
      group.rotation.x += (mouseY * 0.5 - group.rotation.x) * 0.03;
      group.rotation.y += (mouseX * 0.5 - group.rotation.y) * 0.01;
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      renderer.dispose();
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
};

const MarqueeStrip = () => {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className="lp-marquee">
      <div className="lp-marquee__track">
        {items.map((item, i) => (
          <span key={i} className="lp-marquee__item">
            <span className="lp-marquee__dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <div className={`lp-faq__item ${isOpen ? 'lp-faq__item--open' : ''}`}>
    <button className="lp-faq__question" onClick={onToggle}>
      <span>{question}</span>
      <div className="lp-faq__icon">
        <FontAwesomeIcon icon={isOpen ? faMinus : faPlus} />
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div className="lp-faq__answer"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 0.9, 0.36, 1] }}
        >
          <p>{answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('splashShown');
  });
  const menuRef = useRef(null);

  const {
    chatMessages, inputMessage, setInputMessage,
    botTyping, orderStep, chatEndRef,
    handleSendMessage, handleKeyPress, getStatusText,
  } = useWhatsAppChat();

  useEffect(() => {
    if (!loading) return;
    sessionStorage.setItem('splashShown', '1');
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slideContent.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 20);
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
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || loading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen, loading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  const slide = slideContent[slideIndex];

  return (
    <div className="lp-app">
      <AnimatePresence>
        {loading && (
          <motion.div className="lp-preloader" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <motion.div className="lp-preloader__content" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
              <motion.img src={logoImg} alt="Servra" className="lp-preloader__logo" />
              <motion.p className="lp-preloader__version" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}>
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
          </div>
          <div className="lp-nav__right">
            <div className="lp-nav__links">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)}
                  className={`lp-nav__link ${activeNavItem === item.id ? 'lp-nav__link--active' : ''}`}
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
                  <button key={item.id} onClick={() => scrollToSection(item.id)}
                    className={`lp-nav__mobile-link ${activeNavItem === item.id ? 'lp-nav__mobile-link--active' : ''}`}
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

      <section id="home" className="lp-hero">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            className="lp-hero__bg-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {slide.type === 'image' && (
              <>
                <img src={slide.bg} alt="" className="lp-hero__bg-img" aria-hidden="true" />
                <div className="lp-hero__overlay" />
              </>
            )}
            {slide.type === 'wave' && (
              <>
                <div className="lp-hero__dark-bg" />
                <WaveCanvas />
                <div className="lp-hero__glow lp-hero__glow--left" />
                <div className="lp-hero__glow lp-hero__glow--right" />
              </>
            )}
            {slide.type === 'sphere' && (
              <>
                <div className="lp-hero__dark-bg" />
                <SphereCanvas />
                <div className="lp-hero__glow lp-hero__glow--left" />
                <div className="lp-hero__glow lp-hero__glow--right" />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="lp-hero__container">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slideIndex}`}
              className="lp-hero__left"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease: [0.22, 0.9, 0.36, 1] }}
            >
              <div className="lp-badge">
                <FontAwesomeIcon icon={faWhatsapp} className="lp-badge__icon" />
                <span>{slide.badge}</span>
              </div>
              <h1 className="lp-hero__title">{slide.title}</h1>
              <p className="lp-hero__desc">{slide.desc}</p>
              <div className="lp-hero__buttons">
                <button onClick={() => navigate('/waitlist')} className="lp-btn lp-btn--primary lp-btn--lg">
                  <FontAwesomeIcon icon={faWhatsapp} />
                  Start Automating Orders
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="lp-btn lp-btn--outline lp-btn--lg">
                  See how it works <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
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
            </motion.div>
          </AnimatePresence>

          <motion.div className="lp-hero__right" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 0.9, 0.36, 1], delay: 0.15 }}>
            <div className="lp-phone-frame">
              <div className="lp-phone-frame__shell">
                <div className="lp-phone-frame__speaker" />
                <div className="lp-phone-frame__screen">
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
                <div className="lp-phone-frame__home" />
              </div>
              <div className="lp-phone-frame__glow" />
            </div>
          </motion.div>
        </div>
      </section>

      <MarqueeStrip />

      <section id="about" className="lp-about">
        <div className="lp-about__container">
          <div className="lp-about__image-wrapper">
            <img src={aboutImg} alt="About Servra" className="lp-about__image" loading="lazy" />
          </div>
          <div className="lp-about__right">
            <p className="lp-tag">About</p>
            <h2 className="lp-heading">Your WhatsApp.<br />Automated.</h2>
            <p className="lp-about__text">Servra turns your WhatsApp into a 24/7 automated ordering system. Customers message your number, browse your menu, place orders, and confirm delivery — all without you touching your phone.</p>
            <p className="lp-about__text">No extra apps to download. No complex setup. Just connect your WhatsApp and let Servra handle orders, send confirmations, and notify you when a sale comes in. You cook. We handle the rest.</p>
          </div>
        </div>
        <div className="lp-features">
          {featuresList.map((feature, idx) => (
            <motion.div key={idx} className="lp-features__card"
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
                  <motion.div key="back" className="lp-features__back" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <div className="lp-features__icon"><FontAwesomeIcon icon={feature.icon} /></div>
                    <p className="lp-features__back-title">{feature.title}</p>
                    <p className="lp-features__back-text">{feature.description}</p>
                    <span className="lp-features__back-cta">Tap to learn more →</span>
                  </motion.div>
                ) : (
                  <motion.div key="front" className="lp-features__front" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
                    <div className="lp-features__icon"><FontAwesomeIcon icon={feature.icon} /></div>
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
            <h2 className="lp-heading">Set up in minutes.<br />Sell 24/7.</h2>
            <p className="lp-steps__sub">From connecting your WhatsApp to receiving your first automated order — everything is built for busy restaurant owners.</p>
          </div>
          <div className="lp-steps__grid">
            {stepsData.map((step, idx) => (
              <div key={idx} className="lp-steps__card">
                <div className="lp-steps__card-top">
                  <div className="lp-steps__icon"><FontAwesomeIcon icon={step.icon} /></div>
                  <span className="lp-steps__num">{step.number}</span>
                </div>
                <p className="lp-steps__title">{step.title}</p>
                <p className="lp-steps__desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="lp-pricing">
        <div className="lp-pricing__container">
          <div className="lp-pricing__header">
            <p className="lp-tag">Pricing</p>
            <h2 className="lp-heading">Simple, transparent pricing.</h2>
            <p className="lp-pricing__sub">Start small, scale as you grow. No hidden fees, no long-term contracts.</p>
          </div>
          <div className="lp-pricing__grid">
            {[
              { name: 'Starter', price: '₦15,000', period: '/mo', orders: '900', overage: '+₦10 per order above limit', features: ['AI order parsing & confirmation', 'Menu management', 'Order notifications', 'Email support'], popular: false },
              { name: 'Growth', price: '₦35,000', period: '/mo', orders: '2,000', staff: '5', overage: '+₦10 per order above limit', features: ['Everything in Starter', 'Delivery tracking', 'Analytics dashboard', 'Priority support'], popular: true },
              { name: 'Pro', price: '₦75,000', period: '/mo', orders: 'Unlimited', staff: 'Unlimited', features: ['Everything in Growth', 'Custom branding', 'Multi-location support', 'Dedicated account manager'], popular: false },
            ].map((plan, idx) => (
              <motion.div key={idx} className={`lp-pricing__card ${plan.popular ? 'lp-pricing__card--popular' : ''}`} whileHover={{ y: -8 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                {plan.popular && <span className="lp-pricing__badge">Most Popular</span>}
                <p className="lp-pricing__name">{plan.name}</p>
                <div className="lp-pricing__price-row">
                  <span className="lp-pricing__price">{plan.price}</span>
                  <span className="lp-pricing__period">{plan.period}</span>
                </div>
                <div className="lp-pricing__meta">
                  <span><strong>{plan.orders}</strong> orders/mo
                    {plan.overage && <small style={{ display: 'block', color: '#9ca3af', fontSize: '0.72rem', marginTop: '2px' }}>{plan.overage}</small>}
                  </span>
                  {plan.staff && <span><strong>{plan.staff}</strong> staff</span>}
                </div>
                <ul className="lp-pricing__features">
                  {plan.features.map((feat, i) => <li key={i}>{feat}</li>)}
                </ul>
                <button onClick={() => navigate('/waitlist')} className={`lp-btn ${plan.popular ? 'lp-btn--primary' : 'lp-btn--outline'} lp-btn--full`}>
                  Join Waitlist
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="lp-faq">
        <div className="lp-faq__inner">
          <div className="lp-faq__header">
            <p className="lp-tag">FAQ</p>
            <h2 className="lp-heading">Questions? Answered.</h2>
          </div>
          <div className="lp-faq__list">
            {faqData.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      <section className="lp-cta">
        <div className="lp-cta__container">
          <div className="lp-cta__icon"><FontAwesomeIcon icon={faWhatsapp} /></div>
          <h2 className="lp-cta__title">Ready to automate your orders?</h2>
          <p className="lp-cta__text">Join the waitlist today and be the first to turn your WhatsApp into a 24/7 order-taking machine.</p>
          <button onClick={() => navigate('/waitlist')} className="lp-btn lp-btn--wa-lg">
            <FontAwesomeIcon icon={faWhatsapp} className="lp-icon--md" />
            Join the Waitlist
          </button>
          <p className="lp-cta__note">Free during early access · No credit card required</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;