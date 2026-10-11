import React, { useEffect, useRef } from 'react';
import styles from './About.module.css';

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
        {/* Tag */}
        <div className={styles.tag} data-animate>
          <span className={styles.tagDot} aria-hidden="true" /> About the Clinic
        </div>

        <div className={styles.grid}>
          {/* Left: Image */}
          <div className={styles.imageCol} data-animate>
            <div className={styles.imageFrame}>
              <img
                src="/clinic-reception.jpg"
                alt="Marshalign Dental Care reception and waiting area — specialist dental clinic in Trichy"
                className={styles.image}
                loading="lazy"
              />
              <div className={styles.imageOverlay} aria-hidden="true" />
              {/* Badge */}
              <div className={styles.badge}>
                <span className={styles.badgeIcon} aria-hidden="true">★</span>
                <div>
                  <div className={styles.badgeTitle}>Specialist Care</div>
                  <div className={styles.badgeSub}>Trichy, Tamil Nadu</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className={styles.copyCol}>
            <h2 id="about-heading" className={styles.heading} data-animate>
              Specialist Care.<br />
              <span className={styles.headingAccent}>A Personal Touch.</span>
            </h2>

            <p className={styles.body} data-animate>
              Marshalign Dental Care is a specialist dental clinic located in KK Nagar, Trichy. Led by Dr. Marshal Antony M. (Orthodontics & Dentofacial Orthopedics) and Dr. Jose Olive A. (Prosthodontics & Implantology), the clinic brings together focused expertise and genuine patient care under one roof.
            </p>

            <p className={styles.body} data-animate>
              From your first consultation to the completion of your treatment, every step is managed with attention to detail and a deep commitment to your comfort and long-term dental health.
            </p>

            <div className={styles.stats} data-animate>
              <div className={styles.stat}>
                <span className={styles.statNum}>2</span>
                <span className={styles.statLabel}>Specialist Doctors</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.stat}>
                <span className={styles.statNum}>5★</span>
                <span className={styles.statLabel}>Patient Rating</span>
              </div>
              <div className={styles.statDivider} aria-hidden="true" />
              <div className={styles.stat}>
                <span className={styles.statNum}>KK</span>
                <span className={styles.statLabel}>Nagar, Trichy</span>
              </div>
            </div>

            <div className={styles.assetNote} data-animate>
              <span className={styles.noteIcon} aria-hidden="true">📷</span>
              <small>Clinic photography placeholder — to be replaced with actual clinic images.</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
