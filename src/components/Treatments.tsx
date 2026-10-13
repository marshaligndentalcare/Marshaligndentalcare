import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import WhatsAppCTA from './WhatsAppCTA';
import styles from './Treatments.module.css';

const treatments = [
  {
    id: 'orthodontics',
    name: 'Orthodontics & Braces',
    specialty: 'Dr. Marshal Antony M.',
    description:
      'Straighten misaligned teeth and achieve a balanced bite with evidence-based orthodontic treatment. Braces and modern orthodontic appliances tailored to your smile goals.',
    icon: '⟳',
    image: '/orthodontics-treatment.webp',
    alt: 'Orthodontist examining and adjusting braces on patient in dental clinic',
  },
  {
    id: 'dentofacial',
    name: 'Dentofacial Orthopedics',
    specialty: 'Dr. Marshal Antony M.',
    description:
      'Specialist guidance of facial growth and development in younger patients. Corrective appliances and interceptive treatment for lasting facial balance.',
    icon: '◈',
    image: '/dentofacial-orthopedics.webp',
    alt: 'Dentofacial orthopedics consultation and facial growth guidance',
  },
  {
    id: 'implants',
    name: 'Dental Implants',
    specialty: 'Dr. Jose Olive A.',
    description:
      'Replace missing teeth permanently with precision-placed dental implants. A long-term solution that looks, feels, and functions like your natural teeth.',
    icon: '⬡',
    image: '/dental-implant-treatment.webp',
    alt: 'Precision dental implant restoration planning in modern operatory',
  },
  {
    id: 'prosthodontics',
    name: 'Prosthodontics',
    specialty: 'Dr. Jose Olive A.',
    description:
      'Restore the function and aesthetics of your smile with expertly crafted crowns, bridges, dentures, and full-mouth rehabilitation by a specialist prosthodontist.',
    icon: '◇',
    image: '/prosthodontics-treatment.webp',
    alt: 'Prosthodontist assessing custom ceramic dental restoration and crown',
  },
  {
    id: 'examination',
    name: 'General Dental Examination',
    specialty: 'Comprehensive Diagnostics',
    description:
      'Detailed clinical assessment of oral health, periodontal screening, and digital diagnostics to detect dental concerns early and maintain long-term smile wellness.',
    icon: '◎',
    image: '/dental-examination.webp',
    alt: 'Dentist conducting comprehensive oral examination with mouth mirror',
  },
  {
    id: 'cleaning',
    name: 'Professional Teeth Cleaning',
    specialty: 'Preventive Oral Care',
    description:
      'Gentle ultrasonic scaling and dental prophylaxis to remove plaque, tartar, and surface stains, protecting gums and refreshing oral freshness.',
    icon: '✦',
    image: '/teeth-cleaning.webp',
    alt: 'Dental professional performing ultrasonic scaling and teeth cleaning',
  },
  {
    id: 'restorative',
    name: 'Restorative Dentistry',
    specialty: 'Conservative Dental Care',
    description:
      'Tooth-colored composite fillings and conservative restorations that blend seamlessly with natural enamel while restoring strength and chewing function.',
    icon: '❋',
    image: '/restorative-dentistry.webp',
    alt: 'Dentist placing and light-curing tooth-colored composite restoration',
  },
];

const TreatmentCard: React.FC<(typeof treatments)[0] & { index: number }> = ({
  id, name, specialty, description, icon, image, alt, index,
}) => {
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
      id={`treatment-${id}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className={styles.cardImage}>
        <img src={image} alt={alt} loading="lazy" decoding="async" className={styles.img} />
        <div className={styles.imgOverlay} />
        <div className={styles.imgIcon} aria-hidden="true">{icon}</div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardTag}>{specialty}</div>
        <h3 className={styles.cardName}>{name}</h3>
        <p className={styles.cardDesc}>{description}</p>
        <div className={styles.cardActions}>
          <Link
            to={`/treatments/${id}`}
            className={styles.cardDetailBtn}
            aria-label={`View full details for ${name}`}
          >
            Learn More →
          </Link>
          <WhatsAppCTA
            label={`Enquire about ${name}`}
            size="sm"
            variant="outline"
            context={{ type: 'service', serviceName: name }}
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
          {treatments.map((t, i) => (
            <TreatmentCard key={t.id} {...t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Treatments;
