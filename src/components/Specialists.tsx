/**
 * Specialists.tsx — Renders Our Specialists + Consultant Doctors sections.
 *
 * Data is sourced entirely from src/data/doctors.ts.
 * Primary doctors get large cards; consultants get compact cards.
 * No new colours — uses only existing CSS tokens.
 */
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import WhatsAppCTA from './WhatsAppCTA';
import styles from './Specialists.module.css';
import { PRIMARY_DOCTORS, CONSULTANT_DOCTORS } from '../data/doctors';
import type { Doctor } from '../data/doctors';

// ── Primary doctor card (large, existing layout) ──────────────────────────

interface PrimaryCardProps {
  doc: Doctor;
  delay: number;
}

const PrimaryCard: React.FC<PrimaryCardProps> = ({ doc, delay }) => (
  <article
    className={styles.card}
    id={`specialist-${doc.slug}`}
    data-animate
    style={{ transitionDelay: `${delay}s` }}
    aria-label={`${doc.displayName}${doc.specialtyLine ? `, ${doc.specialtyLine}` : ''}`}
  >
    <div className={styles.imageWrap}>
      <picture>
        <source
          srcSet={`${doc.photo.w900} 900w, ${doc.photo.w450} 450w`}
          sizes="(max-width: 480px) 450px, 900px"
          type="image/webp"
        />
        <img
          src={doc.photo.w900}
          alt={doc.alt}
          width={900}
          height={1200}
          className={styles.image}
          style={{ objectPosition: `${doc.focal_x} ${doc.focal_y}` }}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div className={styles.imageGlow} aria-hidden="true" />
      {doc.specialtyLine && (
        <div className={styles.specLabel}>
          <span className={styles.specLabelText}>{doc.specialtyLine}</span>
        </div>
      )}
    </div>

    <div className={styles.info}>
      <Link to={`/specialists/${doc.slug}`} className={styles.nameLink}>
        <h3 className={styles.name}>{doc.displayName}</h3>
      </Link>
      {doc.qualifications && (
        <p className={styles.specTitle}>{doc.qualifications}</p>
      )}
      {doc.short_bio && (
        <p className={styles.bio}>{doc.short_bio}</p>
      )}

      <WhatsAppCTA
        label={`Enquire with ${doc.enquiryName}`}
        size="sm"
        variant="ghost"
        context={{ type: 'doctor', doctorName: doc.enquiryName }}
      />
    </div>
  </article>
);

// ── Consultant compact card ───────────────────────────────────────────────

interface ConsultantCardProps {
  doc: Doctor;
  delay: number;
}

const ConsultantCard: React.FC<ConsultantCardProps> = ({ doc, delay }) => (
  <article
    className={`${styles.card} ${styles.cardCompact}`}
    id={`specialist-${doc.slug}`}
    data-animate
    style={{ transitionDelay: `${delay}s` }}
    aria-label={`${doc.displayName}, Consultant`}
  >
    <div className={`${styles.imageWrap} ${styles.imageWrapCompact}`}>
      <picture>
        <source
          srcSet={`${doc.photo.w900} 900w, ${doc.photo.w450} 450w`}
          sizes="(max-width: 480px) 450px, 900px"
          type="image/webp"
        />
        <img
          src={doc.photo.w450}
          alt={doc.alt}
          width={450}
          height={600}
          className={styles.image}
          style={{ objectPosition: `${doc.focal_x} ${doc.focal_y}` }}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div className={styles.imageGlow} aria-hidden="true" />
      <div className={styles.consultantBadge} aria-label="Consultant">Consultant</div>
    </div>

    <div className={styles.info}>
      <Link to={`/specialists/${doc.slug}`} className={styles.nameLink}>
        <h3 className={styles.name}>{doc.displayName}</h3>
      </Link>
      {doc.qualifications && (
        <p className={styles.specTitle}>{doc.qualifications}</p>
      )}
      {doc.role && (
        <p className={styles.roleLabel}>{doc.role}</p>
      )}
      {doc.short_bio && (
        <p className={styles.bio}>{doc.short_bio}</p>
      )}
      {doc.memberships.length > 0 && (
        <ul className={styles.membershipList} aria-label="Professional memberships">
          {doc.memberships.map((m) => (
            <li key={m} className={styles.membershipChip}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  </article>
);

// ── Root component ────────────────────────────────────────────────────────

const Specialists: React.FC = () => {
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
    <section id="specialists" className={styles.section} ref={sectionRef} aria-labelledby="specialists-heading">
      <div className={styles.container}>

        {/* ── Our Specialists ── */}
        <div className={styles.header} data-animate>
          <div className={styles.tag}>
            <span className={styles.tagDot} aria-hidden="true" /> Our Specialists
          </div>
          <h2 id="specialists-heading" className={styles.heading}>
            Meet the doctors<br />
            <span className={styles.headingAccent}>behind your smile.</span>
          </h2>
          <p className={styles.subheading}>
            Marshalign Dental Care is led by dedicated specialists who bring focused expertise and a personal approach to every patient.
          </p>
        </div>

        <div className={styles.grid}>
          {PRIMARY_DOCTORS.map((doc, i) => (
            <PrimaryCard key={doc.slug} doc={doc} delay={i * 0.15} />
          ))}
        </div>

        {/* ── Consultant Doctors ── */}
        {CONSULTANT_DOCTORS.length > 0 && (
          <>
            <div className={styles.consultantHeader} data-animate>
              <div className={styles.tag}>
                <span className={styles.tagDot} aria-hidden="true" /> Consultant Doctors
              </div>
              <h2 className={styles.headingConsultant}>
                Expert consultation,<br />
                <span className={styles.headingAccent}>when you need it.</span>
              </h2>
            </div>

            <div className={`${styles.grid} ${styles.gridConsultant}`}>
              {CONSULTANT_DOCTORS.map((doc, i) => (
                <ConsultantCard key={doc.slug} doc={doc} delay={i * 0.15} />
              ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
};

export default Specialists;
