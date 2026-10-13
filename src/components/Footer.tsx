import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import WhatsAppCTA from './WhatsAppCTA';
import {
  CLINIC_NAME, CLINIC_TAGLINE, CLINIC_ADDRESS, CLINIC_PHONE,
  CLINIC_PHONE_RAW, CLINIC_MAPS, CLINIC_INSTAGRAM
} from '../config';
import styles from './Footer.module.css';

const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/treatments', label: 'Treatments' },
  { to: '/doctors', label: 'Specialists' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/faq', label: 'FAQ' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Contact' },
];

const TREATMENT_LINKS = [
  { to: '/treatments/orthodontics', label: 'Orthodontics & Braces' },
  { to: '/treatments/dentofacial', label: 'Dentofacial Orthopedics' },
  { to: '/treatments/implants', label: 'Dental Implants' },
  { to: '/treatments/prosthodontics', label: 'Prosthodontics' },
  { to: '/treatments/examination', label: 'General Dental Examination' },
  { to: '/treatments/cleaning', label: 'Professional Teeth Cleaning' },
  { to: '/treatments/restorative', label: 'Restorative Dentistry' },
];

const CURRENT_YEAR = new Date().getFullYear();

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} role="contentinfo" id="footer">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.brandLogo} aria-label="Marshalign Dental Care — Home">
              <img src="/logo.png" alt="Marshalign Dental Care logo" className={styles.logoImg} />
            </Link>
            <p className={styles.brandName}>{CLINIC_NAME}</p>
            <p className={styles.tagline}>"{CLINIC_TAGLINE}"</p>
            <p className={styles.brandAddr}>{CLINIC_ADDRESS}</p>
            <div className={styles.brandCta}>
              <WhatsAppCTA
                label="Enquire on WhatsApp"
                size="sm"
                context={{ type: 'section', sectionName: 'Footer' }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Navigation</h3>
            <ul className={styles.linkList} role="list">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={styles.footLink}
                    aria-label={`Go to ${label} page`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Treatments */}
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Treatments</h3>
            <ul className={styles.linkList} role="list">
              {TREATMENT_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={styles.footLink}
                    aria-label={`View ${label} treatment page`}
                  >
                    {label}
                  </Link>
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
            © {CURRENT_YEAR} {CLINIC_NAME}. All rights reserved.
          </p>
          <div className={styles.legal}>
            <Link
              to="/privacy-policy"
              className={styles.legalLink}
              aria-label="View Privacy Policy and medical disclaimer"
            >
              Privacy Policy
            </Link>
            <span className={styles.legalSep} aria-hidden="true">·</span>
            <Link to="/contact" className={styles.legalLink} aria-label="Contact us">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
