/**
 * Specialists.tsx — Renders the Our Specialists section / Doctor profiles.
 *
 * Data structure is intentionally flexible: all fields except id, name, imageWebp,
 * imageJpg, initials, and alt are optional. Adding qualifications, college,
 * registration number, experience, bio, memberships later only requires data edits.
 *
 * No "coming soon" or placeholder text — fields simply render nothing when absent.
 */
import React, { useEffect, useRef } from 'react';
import WhatsAppCTA from './WhatsAppCTA';
import styles from './Specialists.module.css';

interface Treatment {
  name: string;
  slug: string;
}

interface SpecialistData {
  id: string;
  name: string;
  /** Degrees / qualification line (e.g. "BDS, MDS (Orthodontics & Dentofacial Orthopedics)") */
  degrees?: string;
  /** Specialty title shown on card label */
  specialty?: string;
  /** Short factual bio (2-3 sentences max). Omit if unknown — no placeholders. */
  bio?: string;
  /** Treatments this specialist leads at this clinic (from treatmentsData.ts attributions) */
  treatments?: Treatment[];
  /** Display name used in WhatsApp enquiry message */
  doctorEnquiryName: string;
  imageWebp: string;
  imageJpg: string;
  initials: string;
  alt: string;
}

const specialists: SpecialistData[] = [
  {
    id:                 'dr-marshal',
    name:               'Dr. Marshal Antony M.',
    degrees:            'BDS, MDS — Orthodontics & Dentofacial Orthopedics',
    doctorEnquiryName:  'Dr. Marshal',
    specialty:          'Orthodontics & Dentofacial Orthopedics',
    bio:                'Dr. Marshal Antony M. is a specialist in Orthodontics and Dentofacial Orthopedics at Marshalign Dental Care, Trichy. Clinical focus includes diagnosing and correcting misaligned teeth and jaw relationships, with individualised treatment plans for patients of all ages.',
    treatments: [
      { name: 'Orthodontics & Braces',      slug: '/treatments/orthodontics' },
      { name: 'Dentofacial Orthopedics',     slug: '/treatments/dentofacial-orthopedics' },
    ],
    imageWebp:          '/dr-marshal-antony.webp',
    imageJpg:           '/dr-marshal-antony.jpg',
    initials:           'MA',
    alt:                'Dr. Marshal Antony M., Orthodontist & Dentofacial Orthopedics specialist at Marshalign Dental Care, Trichy',
  },
  {
    id:                 'dr-jose',
    name:               'Dr. Jose Olive A.',
    degrees:            'Prosthodontics & Implantology',
    doctorEnquiryName:  'Dr. Jose Olive',
    specialty:          'Prosthodontics & Implantology',
    bio:                'Dr. Jose Olive A. is part of the clinical team at Marshalign Dental Care, Trichy, specialising in Prosthodontics and Implantology. Areas of clinical focus include prosthetic restorations and dental implants. To book a consultation, send an enquiry on WhatsApp.',
    treatments: [
      { name: 'Dental Implants',   slug: '/treatments/dental-implants' },
      { name: 'Prosthodontics',    slug: '/treatments/prosthodontics' },
    ],
    imageWebp:          '/dr-jose-olive.webp',
    imageJpg:           '/dr-jose-olive.jpg',
    initials:           'JO',
    alt:                'Dr. Jose Olive A., Prosthodontist & Implantology specialist at Marshalign Dental Care, Trichy',
  },
];

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
        <div className={styles.header} data-animate>
          <div className={styles.tag}>
            <span className={styles.tagDot} aria-hidden="true" /> Our Specialists
          </div>
          <h2 id="specialists-heading" className={styles.heading}>
            Meet the doctors<br />
            <span className={styles.headingAccent}>behind your smile.</span>
          </h2>
          <p className={styles.subheading}>
            Marshalign Dental Care is led by two dedicated specialists who bring focused expertise and a personal approach to every patient.
          </p>
        </div>

        <div className={styles.grid}>
          {specialists.map((doc, i) => (
            <article
              key={doc.id}
              className={styles.card}
              id={`specialist-${doc.id}`}
              data-animate
              style={{ transitionDelay: `${i * 0.15}s` }}
              aria-label={`${doc.name}${doc.specialty ? `, ${doc.specialty}` : ''}`}
            >
              <div className={styles.imageWrap}>
                <picture>
                  <source
                    srcSet={`${doc.imageWebp} 900w, ${doc.imageWebp.replace('.webp', '-450.webp')} 450w`}
                    sizes="(max-width: 480px) 450px, 900px"
                    type="image/webp"
                  />
                  <img
                    src={doc.imageJpg}
                    alt={doc.alt}
                    width={900}
                    height={1200}
                    className={styles.image}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <div className={styles.imageGlow} aria-hidden="true" />
                {doc.specialty && (
                  <div className={styles.specLabel}>
                    <span className={styles.specLabelText}>{doc.specialty}</span>
                  </div>
                )}
              </div>

              <div className={styles.info}>
                <h3 className={styles.name}>{doc.name}</h3>
                {doc.degrees && (
                  <p className={styles.specTitle}>{doc.degrees}</p>
                )}
                {doc.bio && (
                  <p className={styles.bio}>{doc.bio}</p>
                )}
                {doc.treatments && doc.treatments.length > 0 && (
                  <ul className={styles.treatmentList} aria-label="Specialist treatments">
                    {doc.treatments.map((t) => (
                      <li key={t.slug} className={styles.treatmentItem}>
                        <a href={t.slug} className={styles.treatmentLink}>{t.name}</a>
                      </li>
                    ))}
                  </ul>
                )}

                <WhatsAppCTA
                  label={`Enquire with ${doc.doctorEnquiryName}`}
                  size="sm"
                  variant="ghost"
                  context={{ type: 'doctor', doctorName: doc.doctorEnquiryName }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Specialists;
