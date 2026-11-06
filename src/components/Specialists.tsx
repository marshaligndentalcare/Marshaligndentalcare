/**
 * Specialists.tsx
 *
 * Renders doctor content in two modes:
 *   mode="home"  — compact 4-card grid for the Home page (default)
 *   mode="page"  — full one-page /specialists layout with jump chips and
 *                  expanded detail sections
 *
 * Data is sourced entirely from src/data/doctors.ts (VISIBLE_DOCTORS).
 * No new colours — uses only existing CSS tokens.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Specialists.module.css';
import { VISIBLE_DOCTORS } from '../data/doctors';
import type { Doctor } from '../data/doctors';
import { WA_NUMBER } from '../config';

// ── WhatsApp helper ───────────────────────────────────────────────────────────
function waLink(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

// ── Jump chip bar (page mode only) ────────────────────────────────────────────
interface JumpChipsProps {
  doctors: Doctor[];
  activeSlug: string;
}

const JumpChips: React.FC<JumpChipsProps> = ({ doctors, activeSlug }) => {
  const handleClick = (slug: string) => {
    const el = document.getElementById(slug);
    if (!el) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  return (
    <nav className={styles.jumpBar} aria-label="Jump to doctor section">
      <ul className={styles.jumpList} role="list">
        {doctors.map(doc => (
          <li key={doc.slug}>
            <button
              type="button"
              className={`${styles.jumpChip} ${activeSlug === doc.slug ? styles.jumpChipActive : ''}`}
              onClick={() => handleClick(doc.slug)}
              aria-current={activeSlug === doc.slug ? 'true' : undefined}
            >
              <img
                src={doc.photo.avatar}
                alt=""
                width={28}
                height={28}
                className={styles.jumpAvatar}
                aria-hidden="true"
              />
              <span className={styles.jumpName}>{doc.displayName.replace('Dr. ', 'Dr.\u00A0')}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// ── Expandable "More about" section ───────────────────────────────────────────
interface ExpandableProps {
  doctorName: string;
  sections: { title: string; content: string }[];
}

const Expandable: React.FC<ExpandableProps> = ({ doctorName, sections }) => {
  const [open, setOpen] = useState(false);
  const shortName = doctorName.replace('Dr. ', '');
  return (
    <div className={styles.expandable}>
      <button
        type="button"
        className={styles.expandBtn}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span>{open ? `Hide about ${shortName}` : `More about ${shortName}`}</span>
        <span className={`${styles.expandIcon} ${open ? styles.expandIconOpen : ''}`} aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className={styles.expandContent}>
          {sections.map((s, i) => (
            <div key={i} className={styles.expandSection}>
              {s.title && <h3 className={styles.expandSectionTitle}>{s.title}</h3>}
              <p className={styles.expandSectionContent}>{s.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Doctor section (page mode) ────────────────────────────────────────────────
interface DoctorSectionProps {
  doc: Doctor;
  index: number; // 0-based; even = photo left, odd = photo right
}

const DoctorSection: React.FC<DoctorSectionProps> = ({ doc, index }) => {
  const isReversed = index % 2 !== 0; // odd index → photo on right (text left)

  const photoCol = (
    <div className={styles.sectionPhotoCol}>
      <div className={styles.photoFrame}>
        <picture>
          <source
            srcSet={`${doc.photo.w900} 900w, ${doc.photo.w450} 450w`}
            sizes="(max-width: 600px) 100vw, (max-width: 1024px) 42vw, 400px"
            type="image/webp"
          />
          <img
            src={doc.photo.w900}
            alt={doc.alt}
            width={900}
            height={1200}
            className={styles.sectionPhoto}
            style={{ objectPosition: `${doc.focal_x} ${doc.focal_y}` }}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      {/* Specialty chip below photo */}
      {doc.specialtyLine && (
        <div className={styles.specialtyChipWrap}>
          <span className={styles.specialtyChip}>{doc.specialtyLine}</span>
        </div>
      )}
    </div>
  );

  const textCol = (
    <div className={styles.sectionTextCol}>
      <h2 className={styles.sectionName}>{doc.displayName}</h2>
      {doc.qualifications && (
        <p className={styles.sectionQuals}>{doc.qualifications}</p>
      )}
      <p className={styles.sectionRole}>{doc.role}</p>

      {/* Specialty chip on mobile (duplicated, hidden on desktop via CSS) */}
      {doc.specialtyLine && (
        <div className={styles.specialtyChipWrapMobile}>
          <span className={styles.specialtyChip}>{doc.specialtyLine}</span>
        </div>
      )}

      <p className={styles.sectionBio}>{doc.short_bio}</p>

      {doc.paragraphs.length > 0 && (
        <div className={styles.sectionParagraphs}>
          {doc.paragraphs.map((p, i) => (
            <p key={i} className={styles.sectionPara}>{p}</p>
          ))}
        </div>
      )}

      {doc.memberships.length > 0 && (
        <div className={styles.membershipsBlock}>
          <h3 className={styles.membershipsLabel}>Memberships</h3>
          <ul className={styles.membershipChips} aria-label="Professional memberships">
            {doc.memberships.map(m => (
              <li key={m} className={styles.membershipChip}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {doc.registrationNo && (
        <p className={styles.regNo}>Registration No: {doc.registrationNo}</p>
      )}

      {doc.extraSections.length > 0 && (
        <Expandable doctorName={doc.displayName} sections={doc.extraSections} />
      )}

      <div className={styles.waCta}>
        <a
          href={waLink(doc.whatsappText)}
          className={styles.waBtn}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Enquire about ${doc.displayName} on WhatsApp`}
        >
          {/* WhatsApp icon SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>Enquire about {doc.displayName} on WhatsApp</span>
        </a>
      </div>
    </div>
  );

  return (
    <article
      id={doc.slug}
      className={styles.doctorSection}
      aria-labelledby={`name-${doc.slug}`}
      data-animate
    >
      <div className={`${styles.sectionGrid} ${isReversed ? styles.sectionGridReversed : ''}`}>
        {isReversed ? (
          <>
            {textCol}
            {photoCol}
          </>
        ) : (
          <>
            {photoCol}
            {textCol}
          </>
        )}
      </div>
      <hr className={styles.sectionDivider} aria-hidden="true" />
    </article>
  );
};

// ── Home compact card ─────────────────────────────────────────────────────────
interface HomeCardProps { doc: Doctor; delay: number; }

const HomeCard: React.FC<HomeCardProps> = ({ doc, delay }) => (
  <article
    className={styles.homeCard}
    data-animate
    style={{ transitionDelay: `${delay}s` }}
    aria-label={`${doc.displayName}${doc.specialtyLine ? `, ${doc.specialtyLine}` : ''}`}
  >
    <Link to={`/specialists#${doc.slug}`} className={styles.homeCardLink} tabIndex={-1} aria-hidden="true">
      <div className={styles.homePhotoFrame}>
        <picture>
          <source
            srcSet={`${doc.photo.w900} 900w, ${doc.photo.w450} 450w`}
            sizes="(max-width: 480px) 100vw, 300px"
            type="image/webp"
          />
          <img
            src={doc.photo.w450}
            alt={doc.alt}
            width={450}
            height={600}
            className={styles.homePhoto}
            style={{ objectPosition: `${doc.focal_x} ${doc.focal_y}` }}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
    </Link>
    <div className={styles.homeCardInfo}>
      <Link to={`/specialists#${doc.slug}`} className={styles.homeNameLink}>
        <h3 className={styles.homeName}>{doc.displayName}</h3>
      </Link>
      <p className={styles.homeRole}>{doc.role}</p>
      <p className={styles.homeBio}>{doc.short_bio}</p>
      <Link to={`/specialists#${doc.slug}`} className={styles.homeProfileLink}>
        View profile →
      </Link>
    </div>
  </article>
);

// ── Root component ────────────────────────────────────────────────────────────
interface SpecialistsProps {
  mode?: 'page' | 'home';
}

const Specialists: React.FC<SpecialistsProps> = ({ mode = 'home' }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeSlug, setActiveSlug] = useState(VISIBLE_DOCTORS[0]?.slug ?? '');

  // Reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add(styles.inView); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Active jump chip tracking (page mode only)
  useEffect(() => {
    if (mode !== 'page') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const slugs = VISIBLE_DOCTORS.map(d => d.slug);
    const els = slugs.map(slug => document.getElementById(slug)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [mode]);

  if (mode === 'page') {
    return (
      <section
        id="specialists"
        className={styles.pageSection}
        ref={sectionRef}
        aria-labelledby="specialists-h1"
      >
        <div className={styles.pageContainer}>
          <div className={styles.pageHeader} data-animate>
            <div className={styles.tag}>
              <span className={styles.tagDot} aria-hidden="true" /> Our Doctors
            </div>
            <h1 id="specialists-h1" className={styles.pageH1}>Meet our doctors</h1>
            <p className={styles.pageSubheading}>
              Marshalign Dental Care brings together specialist doctors, each focused on a different aspect of your dental health.
            </p>
          </div>

          <JumpChips doctors={VISIBLE_DOCTORS} activeSlug={activeSlug} />

          <div className={styles.sectionsWrapper}>
            {VISIBLE_DOCTORS.map((doc, i) => (
              <DoctorSection key={doc.slug} doc={doc} index={i} />
            ))}
          </div>

          <p className={styles.disclaimer}>
            This page is general information, not a diagnosis. Treatment advice is given after an examination.
          </p>
        </div>
      </section>
    );
  }

  // Home mode
  return (
    <section
      id="specialists"
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="specialists-heading"
    >
      <div className={styles.container}>
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

        <div className={styles.homeGrid}>
          {VISIBLE_DOCTORS.map((doc, i) => (
            <HomeCard key={doc.slug} doc={doc} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Specialists;
