import React, { useEffect, useRef } from 'react';
import styles from './WhyUs.module.css';

const reasons = [
  {
    id: 'specialists',
    icon: '◈',
    title: 'Specialist Expertise',
    desc: 'Marshalign is led by two board-certified specialists — in Orthodontics and in Prosthodontics — rather than general practitioners.',
  },
  {
    id: 'personal',
    icon: '◇',
    title: 'Personal Consultations',
    desc: 'Every patient receives a dedicated consultation. Treatment planning is made transparent and collaborative from the first appointment.',
  },
  {
    id: 'communication',
    icon: '⟳',
    title: 'Clear Communication',
    desc: 'We take time to explain your condition, your treatment options, and what to expect at every stage — in plain language.',
  },
  {
    id: 'patient-focused',
    icon: '⬡',
    title: 'Patient-Focused Care',
    desc: 'Decisions are made around your comfort, schedule, and health goals — not around an appointment quota.',
  },
  {
    id: 'environment',
    icon: '◉',
    title: 'Calm Clinic Environment',
    desc: 'The clinic is designed to be a comfortable, unhurried space where you feel at ease from the moment you walk in.',
  },
  {
    id: 'trichy',
    icon: '◌',
    title: 'Accessible Location',
    desc: 'Conveniently located on Rajaram Road, near KK Nagar Bus Terminal in Trichy — easy to reach from across the city.',
  },
];

const WhyUs: React.FC = () => {
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
    <section id="why-us" className={styles.section} ref={sectionRef} aria-labelledby="why-heading">
      <div className={styles.container}>
        <div className={styles.header} data-animate>
          <div className={styles.tag}>
            <span className={styles.tagDot} aria-hidden="true" /> Why Marshalign
          </div>
          <h2 id="why-heading" className={styles.heading}>
            Why patients choose<br />
            <span className={styles.headingAccent}>Marshalign.</span>
          </h2>
        </div>

        <div className={styles.grid}>
          {reasons.map((r, i) => (
            <div
              key={r.id}
              className={styles.card}
              data-animate
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className={styles.iconWrap} aria-hidden="true">
                <span className={styles.icon}>{r.icon}</span>
              </div>
              <div>
                <h3 className={styles.cardTitle}>{r.title}</h3>
                <p className={styles.cardDesc}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
