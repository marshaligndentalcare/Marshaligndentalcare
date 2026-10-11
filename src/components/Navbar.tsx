import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import WhatsAppCTA from './WhatsAppCTA';
import { CLINIC_PHONE, CLINIC_PHONE_RAW } from '../config';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#treatments', label: 'Treatments' },
  { href: '#specialists', label: 'Specialists' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} role="banner">
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#hero" className={styles.logo} onClick={(e) => handleNavClick(e, '#hero')} aria-label="Marshalign Dental Care — Home">
            <img src="/logo.png" alt="Marshalign Dental Care logo" className={styles.logoImg} />
            <div className={styles.logoText}>
              <span className={styles.logoName}>MARSHALIGN</span>
              <span className={styles.logoClaim}>Dental Care</span>
            </div>
          </a>

          <ul className={styles.links} role="list">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className={styles.link}
                  onClick={(e) => handleNavClick(e, href)}
                  aria-label={`Navigate to ${label} section`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <a href={`tel:${CLINIC_PHONE_RAW}`} className={styles.phoneLink} aria-label={`Call Marshalign Dental Care at ${CLINIC_PHONE}`}>
              <Phone size={16} aria-hidden="true" />
              <span className={styles.phoneNum}>{CLINIC_PHONE}</span>
            </a>
            <WhatsAppCTA label="WhatsApp" size="sm" />
          </div>

          <button
            className={styles.burger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Mobile navigation menu"
      >
        <ul role="list">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a href={href} className={styles.mobileLink} onClick={(e) => handleNavClick(e, href)}>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className={styles.mobileActions}>
          <a href={`tel:${CLINIC_PHONE_RAW}`} className={styles.mobilePhone} aria-label={`Call ${CLINIC_PHONE}`}>
            <Phone size={18} /> {CLINIC_PHONE}
          </a>
          <WhatsAppCTA label="Enquire on WhatsApp" size="md" />
        </div>
      </div>
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} aria-hidden="true" />}
    </>
  );
};

export default Navbar;
