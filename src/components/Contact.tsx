import React, { useEffect, useRef } from 'react';
import { Phone, MapPin, ExternalLink } from 'lucide-react';
import WhatsAppCTA from './WhatsAppCTA';
import {
  CLINIC_NAME, CLINIC_ADDRESS, CLINIC_PHONE, CLINIC_PHONE_RAW,
  CLINIC_MAPS, CLINIC_INSTAGRAM
} from '../config';
import styles from './Contact.module.css';

const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add(styles.inView); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className={styles.section} ref={sectionRef} aria-labelledby="contact-heading">
      <div className={styles.container}>
        <div className={styles.header} data-animate>
          <div className={styles.tag}>
            <span className={styles.tagDot} aria-hidden="true" /> Contact
          </div>
          <h2 id="contact-heading" className={styles.heading}>
            Find us in Trichy.<br />
            <span className={styles.headingAccent}>We'd love to help.</span>
          </h2>
        </div>

        <div className={styles.grid}>
          {/* Contact info */}
          <div className={styles.infoCard} data-animate>
            <h3 className={styles.clinicName}>{CLINIC_NAME}</h3>

            <address className={styles.details}>
              <a
                href={CLINIC_MAPS}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.detailRow}
                aria-label={`Get directions to ${CLINIC_NAME} on Google Maps`}
              >
                <span className={styles.detailIcon}><MapPin size={18} aria-hidden="true" /></span>
                <span>{CLINIC_ADDRESS}</span>
                <ExternalLink size={14} className={styles.extIcon} aria-hidden="true" />
              </a>

              <a
                href={`tel:${CLINIC_PHONE_RAW}`}
                className={styles.detailRow}
                aria-label={`Call ${CLINIC_NAME} at ${CLINIC_PHONE}`}
              >
                <span className={styles.detailIcon}><Phone size={18} aria-hidden="true" /></span>
                <span>{CLINIC_PHONE}</span>
              </a>

              <a
                href={CLINIC_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.detailRow}
                aria-label="Visit Marshalign Dental Care on Instagram"
              >
                <span className={styles.detailIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </span>
                <span>@marshalign_dental_trichy</span>
                <ExternalLink size={14} className={styles.extIcon} aria-hidden="true" />
              </a>
            </address>

            <div className={styles.hoursNote}>
              <span className={styles.hoursIcon} aria-hidden="true">🕐</span>
              <small>Opening hours — contact the clinic directly to confirm current timings.</small>
            </div>

            <div className={styles.ctaGroup}>
              <WhatsAppCTA label="Enquire on WhatsApp" size="md" />
              <a
                href={`tel:${CLINIC_PHONE_RAW}`}
                className={styles.callBtn}
                aria-label={`Call ${CLINIC_PHONE}`}
              >
                <Phone size={16} aria-hidden="true" />
                Call Now
              </a>
            </div>
          </div>

          {/* Map embed */}
          <div className={styles.mapCard} data-animate>
            <div className={styles.mapFrame}>
              <iframe
                title="Marshalign Dental Care map location, 345 Rajaram Road KK Nagar Trichy"
                src="https://maps.google.com/maps?q=345+Rajaram+Road+KK+Nagar+Trichy+Tamil+Nadu&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={CLINIC_MAPS}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapsLink}
              aria-label="Open directions in Google Maps"
            >
              <MapPin size={14} aria-hidden="true" />
              Get Directions on Google Maps
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
