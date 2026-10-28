import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../lib/seo';
import WhatsAppCTA from '../components/WhatsAppCTA';
import styles from './NotFoundPage.module.css';

const NotFoundPage: React.FC = () => {
  useSEO({
    title: '404 - Page Not Found | Marshalign Dental Care, Trichy',
    description: 'The page you are looking for does not exist or has been moved.',
    canonical: '/',
    noindex: true,
  });

  return (
    <section className={styles.section} aria-labelledby="not-found-heading">
      <div className={styles.container}>
        <div className={styles.badge}>404 Error</div>
        <h1 id="not-found-heading" className={styles.heading}>
          Page Not Found
        </h1>
        <p className={styles.description}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.homeBtn}>
            Return to Homepage
          </Link>
          <Link to="/treatments" className={styles.outlineBtn}>
            Explore Treatments
          </Link>
          <WhatsAppCTA
            label="Chat with Us"
            size="md"
            context={{ type: 'general' }}
          />
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
