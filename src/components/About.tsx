import React, { useEffect, useRef } from 'react';
import styles from './About.module.css';

const CLINIC_FACTS = [
  { value: '2', label: 'Board-Certified\nSpecialists' },
  { value: 'Specialist', label: 'Orthodontics &\nProsthodontics' },
  { value: 'KK Nagar', label: 'Trichy,\nTamil Nadu' },
];

const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.inView);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className={styles.section} ref={sectionRef} aria-labelledby="about-heading">
      <div className={styles.container}>
        {/* Editorial Tag */}
        <div className={styles.tag} data-animate>
          <span className={styles.tagDot} aria-hidden="true" />
          About Marshalign Dental Care
        </div>

        <div className={styles.grid}>
          {/* Left: Refined Hospital Imagery */}
          <div className={styles.imageCol} data-animate>
            <div className={styles.imageStack}>
              {/* Main grounded clinic image */}
              <div className={styles.imageFrame}>
                <div className={styles.imageInner}>
                  <img
                    src="/clinic-reception.jpg"
                    alt="Marshalign Dental Care reception and waiting lounge — specialist clinic in Trichy"
                    className={styles.image}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: '50% 40%' }}
                  />
                </div>
                <div className={styles.imageOverlay} aria-hidden="true" />

                {/* Grounded clinic badge */}
                <div className={styles.badge}>
                  <span className={styles.badgeIndicator} aria-hidden="true" />
                  <div>
                    <div className={styles.badgeTitle}>Specialist Practice</div>
                    <div className={styles.badgeSub}>Rajaram Road, Trichy</div>
                  </div>
                </div>
              </div>

              {/* Secondary overlapping clinical suite thumbnail */}
              <div className={styles.accentFrame} aria-hidden="true">
                <img
                  src="/treatment-room.jpg"
                  alt="Marshalign modern clinical treatment suite in Trichy"
                  className={styles.accentImage}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: '50% 35%' }}
                />
                <div className={styles.accentCaption}>Clinical Suite</div>
              </div>
            </div>
          </div>

          {/* Right: Editorial Copy Column */}
          <div className={styles.copyCol}>
            <h2 id="about-heading" className={styles.heading} data-animate>
              Specialist Care.<br />
              <span className={styles.headingAccent}>A More Personal Experience.</span>
            </h2>

            <p className={styles.body} data-animate>
              Marshalign Dental Care is a specialist dental clinic in KK Nagar, Trichy, founded on the principle of focused medical expertise and calm, unhurried care. Led by Dr. Marshal Antony M. (Specialist in Orthodontics &amp; Dentofacial Orthopedics) and Dr. Jose Olive A. (Specialist in Prosthodontics &amp; Implantology), our practice unites advanced dental disciplines under one roof.
            </p>

            <p className={styles.body} data-animate>
              Rather than rushed consultations, every visit is guided by thorough clinical diagnosis, transparent communication, and an individualized treatment plan tailored to your health goals, facial harmony, and long-term comfort.
            </p>

            {/* Verified clinic facts */}
            <div className={styles.factsRow} data-animate>
              {CLINIC_FACTS.map((fact, i) => (
                <React.Fragment key={i}>
                  <div className={styles.fact}>
                    <span className={styles.factValue}>{fact.value}</span>
                    <span className={styles.factLabel}>
                      {fact.label.split('\n').map((line, j) => (
                        <span key={j} className={styles.factLabelLine}>
                          {line}
                        </span>
                      ))}
                    </span>
                  </div>
                  {i < CLINIC_FACTS.length - 1 && (
                    <div className={styles.factDivider} aria-hidden="true" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
