import React, { useEffect, useRef } from 'react';
import WhatsAppCTA from './WhatsAppCTA';
import styles from './Specialists.module.css';

const specialists = [
  {
    id: 'dr-marshal',
    name: 'Dr. Marshal Antony M.',
    degrees: 'BDS, MDS (Orthodontics & Dentofacial Orthopedics)',
    doctorEnquiryName: 'Dr. Marshal',
    specialty: 'Orthodontics & Dentofacial Orthopedics',
    bio: 'Dr. Marshal Antony M. is a specialist in Orthodontics and Dentofacial Orthopedics. His practice focuses on diagnosing and correcting misaligned teeth and jaws, providing patients of all ages with personalised treatment plans for lasting, healthy smiles.',
    image: '/dr-marshal-antony.jpg',
    initials: 'MA',
  },
  {
    id: 'dr-jose',
    name: 'Dr. Jose Olive A.',
    degrees: 'BDS, MDS (Prosthodontics & Implantology)',
    doctorEnquiryName: 'Dr. Jose Olive',
    specialty: 'Prosthodontics & Implantology',
    bio: 'Dr. Jose Olive A. specialises in Prosthodontics and Implantology. He focuses on the restoration and replacement of teeth using crowns, bridges, dentures, and dental implants, helping patients regain function and confidence in their smiles.',
    image: '/dr-jose-olive.jpg',
    initials: 'JO',
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
              aria-label={`${doc.name}, ${doc.specialty}`}
            >
              <div className={styles.imageWrap}>
                <img
                  src={doc.image}
                  alt={`${doc.name} — Specialist in ${doc.specialty} at Marshalign Dental Care, Trichy`}
                  className={styles.image}
                  loading="lazy"
                  decoding="async"
                />
                <div className={styles.imageGlow} aria-hidden="true" />
                <div className={styles.specLabel}>
                  <span className={styles.specLabelText}>{doc.specialty}</span>
                </div>
              </div>

              <div className={styles.info}>
                <h3 className={styles.name}>{doc.name}</h3>
                <p className={styles.specTitle}>{doc.degrees}</p>
                <p className={styles.bio}>{doc.bio}</p>


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
