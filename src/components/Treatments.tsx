import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import WhatsAppCTA from './WhatsAppCTA';
import { TREATMENTS, type TreatmentPageData } from '../data/treatmentsData';
import styles from './Treatments.module.css';

interface TreatmentCardProps {
  treatment: TreatmentPageData;
  index: number;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({ treatment, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add(styles.inView); },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isEven ? styles.cardNormal : styles.cardReverse}`}
      id={`treatment-${treatment.id}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className={styles.cardImage}>
        <img
          src={treatment.image}
          alt={treatment.alt}
          loading="lazy"
          decoding="async"
          className={styles.img}
        />
        <div className={styles.imgOverlay} />
        <div className={styles.imgIcon} aria-hidden="true">{treatment.icon}</div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardTag}>{treatment.attribution}</div>
        <h3 className={styles.cardName}>{treatment.name}</h3>
        <p className={styles.cardDesc}>{treatment.shortDescription}</p>
        <div className={styles.cardActions}>
          <Link
            to={`/treatments/${treatment.slug}`}
            className={styles.cardDetailBtn}
            aria-label={`View full details for ${treatment.name}`}
          >
            Learn More →
          </Link>
          <WhatsAppCTA
            label={`Enquire about ${treatment.name}`}
            size="sm"
            variant="outline"
            context={{ type: 'service', serviceName: treatment.name }}
          />
        </div>
      </div>
    </div>
  );
};

const Treatments: React.FC = () => {
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add(styles.inView); },
      { threshold: 0.1 }
    );
    if (headRef.current) observer.observe(headRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="treatments" className={styles.section} aria-labelledby="treatments-heading">
      <div className={styles.container}>
        <div ref={headRef} className={styles.header}>
          <div className={styles.tag} data-animate>
            <span className={styles.tagDot} aria-hidden="true" /> Our Treatments
          </div>
          <h2 id="treatments-heading" className={styles.heading} data-animate>
            Specialist dental services<br />
            <span className={styles.headingAccent}>designed around you.</span>
          </h2>
          <p className={styles.subheading} data-animate>
            Each treatment is planned and delivered by our specialist doctors, guided by your unique dental needs and long-term goals.
          </p>
        </div>

        <div className={styles.cards}>
          {TREATMENTS.map((treatment, i) => (
            <TreatmentCard key={treatment.id} treatment={treatment} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Treatments;
