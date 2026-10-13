import React, { useRef, useEffect } from 'react';
import WhatsAppCTA from './WhatsAppCTA';
import styles from './Hero.module.css';
import { ChevronDown } from 'lucide-react';

const VIDEO_SRC = '/animated-video.mp4';

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays continuously on mount at 0.75x speed
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 0.75;
      video.play().catch(() => {
        // Autoplay policy fallback: user interaction will trigger playback
      });
    }
  }, []);

  const handleVideoReady = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75;
    }
  };

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
            Specialist dental care, advanced orthodontics &amp; implants,<br className={styles.subtextBreak} />
            and a personal, unhurried approach to every patient in Trichy.
          </p>

          <div className={styles.ctas}>
            <WhatsAppCTA
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

        {/* Right column: prominent tooth video animation */}
        <div className={styles.visualColumn}>
          <div className={styles.visualWrap}>
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadedMetadata={handleVideoReady}
              onPlay={handleVideoReady}
              className={styles.toothVideo}
              aria-label="Marshalign Dental Care — 3D Tooth Animation"
            />
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
