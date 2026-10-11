import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import WhatsAppCTA from './WhatsAppCTA';
import {
  CLINIC_NAME, CLINIC_TAGLINE, CLINIC_ADDRESS, CLINIC_PHONE,
  CLINIC_PHONE_RAW, CLINIC_MAPS, CLINIC_INSTAGRAM
} from '../config';
import styles from './Footer.module.css';

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#treatments', label: 'Treatments' },
  { href: '#specialists', label: 'Specialists' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
  { href: '#faq', label: 'FAQ' },
];

const TREATMENT_LINKS = [
  { href: '#treatment-orthodontics', label: 'Orthodontics & Braces' },
  { href: '#treatment-dentofacial', label: 'Dentofacial Orthopedics' },
  { href: '#treatment-prosthodontics', label: 'Prosthodontics' },
  { href: '#treatment-implants', label: 'Dental Implants' },
];

const scrollTo = (href: string) => {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} role="contentinfo" id="footer">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <a href="#hero" className={styles.brandLogo} onClick={(e) => { e.preventDefault(); scrollTo('#hero'); }} aria-label="Back to top">
              <img src="/logo.png" alt="Marshalign Dental Care logo" className={styles.logoImg} />
            </a>
            <p className={styles.brandName}>{CLINIC_NAME}</p>
            <p className={styles.tagline}>"{CLINIC_TAGLINE}"</p>
            <p className={styles.brandAddr}>{CLINIC_ADDRESS}</p>
            <div className={styles.brandCta}>
              <WhatsAppCTA label="Enquire on WhatsApp" size="sm" />
            </div>
          </div>

          {/* Navigation */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Navigation</h3>
            <ul className={styles.linkList} role="list">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={styles.footLink}
                    onClick={(e) => { e.preventDefault(); scrollTo(href); }}
                    aria-label={`Go to ${label}`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Treatments */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Treatments</h3>
            <ul className={styles.linkList} role="list">
              {TREATMENT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className={styles.footLink}
                    onClick={(e) => { e.preventDefault(); scrollTo(href); }}
                    aria-label={`View ${label} treatment`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Contact</h3>
            <ul className={styles.contactList} role="list">
              <li>
                <a href={`tel:${CLINIC_PHONE_RAW}`} className={styles.contactRow} aria-label={`Call ${CLINIC_PHONE}`}>
                  <Phone size={14} aria-hidden="true" className={styles.contactIcon} />
                  {CLINIC_PHONE}
                </a>
              </li>
              <li>
                <a href={CLINIC_MAPS} target="_blank" rel="noopener noreferrer" className={styles.contactRow} aria-label="Get Google Maps directions">
                  <MapPin size={14} aria-hidden="true" className={styles.contactIcon} />
                  Get Directions
                </a>
              </li>
              <li>
                <a href={CLINIC_INSTAGRAM} target="_blank" rel="noopener noreferrer" className={styles.contactRow} aria-label="Marshalign on Instagram">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.contactIcon} aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  @marshalign_dental_trichy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {CLINIC_NAME}. All rights reserved.
          </p>
          <div className={styles.legal}>
            <a href="#privacy" className={styles.legalLink} aria-label="Privacy Policy">Privacy Policy</a>
            <span className={styles.legalSep} aria-hidden="true">·</span>
            <a href="#contact" className={styles.legalLink} onClick={(e) => { e.preventDefault(); scrollTo('#contact'); }} aria-label="Contact us">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
