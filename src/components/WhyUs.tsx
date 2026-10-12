import React, { useEffect, useRef, useState } from 'react';
import styles from './WhyUs.module.css';

const TICKER_ITEMS = [
  'Specialist Dental Care',
  'Personalised Consultations',
  'Clear Communication',
  'Patient-Focused Care',
  'Modern Clinical Environment',
  'Convenient Trichy Location',
];

const features = [
  {
    number: '01',
    title: 'Specialist Dental Care',
    subtitle: 'Orthodontics & Prosthodontics Specialists',
    desc: 'Led by board-certified specialists in Orthodontics & Dentofacial Orthopedics and Prosthodontics & Implantology, delivering focused advanced dental disciplines rather than routine general dentistry.',
  },
  {
    number: '02',
    title: 'Personalised Consultations',
    subtitle: 'Transparent, collaborative planning',
    desc: 'Every patient receives dedicated one-on-one time with the specialists. Diagnosis, imaging, and treatment timelines are thoroughly planned with you before beginning.',
  },
  {
    number: '03',
    title: 'Clear Communication',
    subtitle: 'Plain language at every step',
    desc: 'We explain clinical conditions, treatment alternatives, step-by-step procedures, and recovery expectations in clear, jargon-free language so you are always fully informed.',
  },
  {
    number: '04',
    title: 'Patient-Focused Care',
    subtitle: 'Comfort and long-term health first',
    desc: 'Clinical decisions are tailored entirely around your individual comfort, schedule, and oral health goals rather than appointment quotas or expedited treatments.',
  },
  {
    number: '05',
    title: 'Modern Clinical Environment',
    subtitle: 'Hygienic, calm, and unhurried',
    desc: 'The clinic is intentionally designed as a tranquil, immaculate setting with modern dental infrastructure, ensuring complete peace of mind during every procedure.',
  },
  {
    number: '06',
    title: 'Convenient Trichy Location',
    subtitle: 'Rajaram Road, near KK Nagar Bus Terminal',
    desc: 'Centrally situated at 345, Rajaram Road in Trichy – 21, providing seamless accessibility for families and professionals travelling from across the city and surrounding areas.',
  },
];

const WhyUs: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.inView);
        }
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="why-us" className={styles.section} ref={sectionRef} aria-labelledby="why-heading">
      <div className={styles.container}>
        {/* Editorial Section Heading */}
        <div className={styles.header} data-animate>
          <div className={styles.tag}>
            <span className={styles.tagDot} aria-hidden="true" />
            Why Marshalign
          </div>
          <h2 id="why-heading" className={styles.heading}>
            Why Marshalign
          </h2>
          <p className={styles.subline}>
            Specialist expertise. Thoughtful care. A more personal dental experience.
          </p>
        </div>
      </div>

      {/* Continuous Right-to-Left Horizontal Ticker Strip */}
      <div className={styles.tickerWrapper} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {/* First loop */}
          <div className={styles.tickerGroup}>
            {TICKER_ITEMS.map((item, i) => (
              <span key={`ticker-1-${i}`} className={styles.tickerItem}>
                <span className={styles.tickerText}>{item}</span>
                <span className={styles.tickerDivider}>✦</span>
              </span>
            ))}
          </div>
          {/* Second duplicate loop for seamless continuous movement */}
          <div className={styles.tickerGroup}>
            {TICKER_ITEMS.map((item, i) => (
              <span key={`ticker-2-${i}`} className={styles.tickerItem}>
                <span className={styles.tickerText}>{item}</span>
                <span className={styles.tickerDivider}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Numbered Editorial Feature Rows Below Ticker */}
      <div className={styles.container}>
        <div className={styles.featuresList} data-animate>
          {features.map((feature, index) => {
            const isActive = activeRow === index;
            return (
              <div
                key={feature.number}
                className={`${styles.featureRow} ${isActive ? styles.featureRowActive : ''}`}
                onMouseEnter={() => setActiveRow(index)}
                onMouseLeave={() => setActiveRow(null)}
                tabIndex={0}
                onFocus={() => setActiveRow(index)}
                onBlur={() => setActiveRow(null)}
              >
                {/* Number column */}
                <div className={styles.numberCol}>
                  <span className={styles.number}>{feature.number}</span>
                </div>

                {/* Title & subtitle column */}
                <div className={styles.titleCol}>
                  <h3 className={styles.title}>{feature.title}</h3>
                  <span className={styles.subtitle}>{feature.subtitle}</span>
                </div>

                {/* Description column */}
                <div className={styles.descCol}>
                  <p className={styles.desc}>{feature.desc}</p>
                </div>

                {/* Visual hover indicator */}
                <div className={styles.rowAccent} aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
