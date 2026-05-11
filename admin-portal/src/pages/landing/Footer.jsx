import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faTiktok, faInstagram, faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="lp-footer">
      <div className="lp-footer__container">
        <div className="lp-footer__top">
          <div className="lp-footer__brand">
            <h3 className="lp-footer__logo">
              Ser<span className="lp-footer__logo-accent">vra</span>
            </h3>
            <p className="lp-footer__tagline">
              Turn your WhatsApp into a 24/7 order-taking machine.
            </p>
          </div>

          <div className="lp-footer__links">
            <div className="lp-footer__col">
              <p className="lp-footer__col-title">Product</p>
              <button onClick={() => navigate('/')} className="lp-footer__link">Home</button>
              <button onClick={() => navigate('/pricing')} className="lp-footer__link">Pricing</button>
              <a href="#how-it-works" className="lp-footer__link">How It Works</a>
            </div>

            <div className="lp-footer__col">
              <p className="lp-footer__col-title">Company</p>
              <a href="#about" className="lp-footer__link">About</a>
              <button onClick={() => navigate('/waitlist')} className="lp-footer__link">Join Waitlist</button>
              <button onClick={() => navigate('/login')} className="lp-footer__link">Sign In</button>
            </div>

            <div className="lp-footer__col">
              <p className="lp-footer__col-title">Legal</p>
              <a href="#" className="lp-footer__link">Privacy Policy</a>
              <a href="#" className="lp-footer__link">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="lp-footer__bottom">
          <p className="lp-footer__copy">© {year} Servra. All rights reserved.</p>
          <div className="lp-footer__socials">
            <a href="https://www.tiktok.com/@useservra" target="_blank" rel="noreferrer" className="lp-footer__social-link" aria-label="TikTok">
              <FontAwesomeIcon icon={faTiktok} />
            </a>
            <a href="https://www.instagram.com/useservra" target="_blank" rel="noreferrer" className="lp-footer__social-link" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://x.com/useservra" target="_blank" rel="noreferrer" className="lp-footer__social-link" aria-label="X (Twitter)">
              <FontAwesomeIcon icon={faXTwitter} />
            </a>
            <a href="https://www.linkedin.com/company/useservra" target="_blank" rel="noreferrer" className="lp-footer__social-link" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
          </div>
          <a
            href="https://wa.me/2349133867929"
            target="_blank"
            rel="noreferrer"
            className="lp-footer__whatsapp"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
            Chat with us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;