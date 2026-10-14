import React, { useRef } from 'react';
import WhatsAppCTA from './WhatsAppCTA';
import styles from './Hero.module.css';
import { ChevronDown } from 'lucide-react';
import { ToothErrorBoundary } from './ToothErrorBoundary';
import { Suspense } from 'react';
import InteractiveTooth from './InteractiveTooth';

const Hero: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement>(null);

  const scrollToNext = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="hero"
      className={styles.heroSection}
      aria-label="Hero — Marshalign Dental Care"
    >
      {/* Background square grid */}
      <div className={styles.bgGrid} aria-hidden="true" />

      {/* Two-column layout */}
      <div className={styles.inner}>
        {/* Left column: brand copy */}
        <div className={styles.copy}>
          <div className={styles.label}>
            <span className={styles.labelDot} aria-hidden="true" />
            MARSHALIGN DENTAL CARE · SPECIALIST DENTAL CLINIC, TRICHY
          </div>

          <h1 className={styles.headline}>
            <span className={styles.headlineDark}>Your Smile.</span>
            <br />
            <span className={styles.headlineGradient}>Reimagined.</span>
          </h1>

          <p className={styles.subtext}>
            Specialist dental care, advanced orthodontics &amp; implants, and a personal, unhurried approach to every patient in Trichy.
          </p>

          <div className={styles.ctas}>
            <WhatsAppCTA
              id="hero-whatsapp-btn"
              label="Enquire on WhatsApp"
              size="lg"
              context={{ type: 'section', sectionName: 'Hero' }}
            />
            <a
              href="#treatments"
              className={styles.secondaryCta}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('treatments')?.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="Explore our treatments"
            >
              Explore Treatments
            </a>
          </div>
        </div>

        {/* Right column: 3D interactive tooth — no lazy/dynamic, loaded immediately */}
        <div className={styles.visualColumn}>
          <div className={styles.visualWrap} ref={wrapRef}>
            <ToothErrorBoundary
              fallback={
                /* Static placeholder — same size, no video, no layout shift */
                <div className={styles.toothPlaceholder} aria-hidden="true" />
              }
            >
              <Suspense
                fallback={
                  <div className={styles.toothPlaceholder} aria-hidden="true" />
                }
              >
                <InteractiveTooth className={styles.toothCanvas} />
              </Suspense>
            </ToothErrorBoundary>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        className={styles.scrollIndicator}
        onClick={scrollToNext}
        aria-label="Scroll to About section"
      >
        <ChevronDown size={18} aria-hidden="true" />
        <span>SCROLL</span>
      </button>
    </section>
  );
};

export default Hero;
