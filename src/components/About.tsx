import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './About.module.css';
import GalleryLightbox from './gallery/GalleryLightbox';
import type { GalleryItem } from '../data/galleryTypes';
import {
  inaugurationData,
  inaugurationsVisible,
  getRibbonDescription,
  GROUP_DESCRIPTION,
} from '../data/inauguration';

const CLINIC_FACTS = [
  { value: '2', label: 'Board-Certified\nSpecialists' },
  { value: 'Specialist', label: 'Orthodontics &\nProsthodontics' },
  { value: 'KK Nagar', label: 'Trichy,\nTamil Nadu' },
];

interface AboutProps {
  /** If true, renders the "Our Story" section after the doctors' intro (AboutPage only). */
  showStory?: boolean;
}

const About: React.FC<AboutProps> = ({ showStory = false }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const storyRef   = useRef<HTMLElement>(null);

  // Lightbox state for "Our Story" photos
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('lb');
      if (p !== null && !isNaN(Number(p))) return Number(p);
    }
    return null;
  });
  const openLightbox   = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox  = useCallback(() => setLightboxIndex(null), []);
  const navigateLb     = useCallback((index: number) => setLightboxIndex(index), []);

  const showInauguration = showStory && inaugurationsVisible(inaugurationData);

  // Main about section reveal
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

  // "Our Story" scroll-reveal
  useEffect(() => {
    if (!showInauguration) return;
    const el = storyRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.inStoryView);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showInauguration]);

  // Gallery items for the Our Story lightbox
  const storyItems: GalleryItem[] = [
    {
      id: 'inauguration-ribbon-cutting',
      type: 'photo',
      category: 'inauguration',
      caption: 'Grand Opening',
      alt: 'Ribbon-cutting at the entrance during the opening of Marshalign Dental Care, with guests gathered behind',
      description: getRibbonDescription(inaugurationData),
      src: '/gallery/inauguration/inauguration-ribbon-cutting-1600.webp',
      srcset:
        '/gallery/inauguration/inauguration-ribbon-cutting-400.webp 400w, /gallery/inauguration/inauguration-ribbon-cutting-800.webp 800w, /gallery/inauguration/inauguration-ribbon-cutting-1600.webp 1600w',
      sizes: '(max-width: 960px) 100vw, 65vw',
      width: 1600,
      height: 910,
      focus: '50% 35%',
      featured: true,
      allowPeople: true,
      chip: 'INAUGURATION',
    },
    {
      id: 'inauguration-group',
      type: 'photo',
      category: 'inauguration',
      caption: 'Opening Day Celebration',
      alt: 'Clinic team, family and guests posing in the reception on opening day',
      description: GROUP_DESCRIPTION,
      src: '/gallery/inauguration/inauguration-group-1600.webp',
      srcset:
        '/gallery/inauguration/inauguration-group-400.webp 400w, /gallery/inauguration/inauguration-group-800.webp 800w, /gallery/inauguration/inauguration-group-1600.webp 1600w',
      sizes: '(max-width: 960px) 100vw, 65vw',
      width: 1600,
      height: 900,
      focus: '40% 30%',
      featured: true,
      allowPeople: true,
      chip: 'INAUGURATION',
    },
  ];

  return (
    <>
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
                      width={1280}
                      height={960}
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
                    width={800}
                    height={600}
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
                Marshalign Dental Care is a specialist dental clinic in KK Nagar, Trichy, founded on the principle of focused medical expertise and calm, unhurried care. The clinic is led by Dr. Marshal Antony M. (Specialist in Orthodontics &amp; Dentofacial Orthopedics) and Dr. Jose Olive A. (Specialist in Prosthodontics &amp; Implantology), alongside Dr. Meenakshi (Specialist Endodontist) and Dr. J. Sowmiya (MDS).
              </p>

              <p className={styles.body} data-animate>
                Rather than rushed visits, every appointment is guided by thorough clinical diagnosis, transparent communication, and an individualized treatment plan tailored to your health goals, facial harmony, and long-term comfort.
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

      {/* Our Story section (About page only, privacy-gated) */}
      {showInauguration && (
        <section
          id="our-story"
          className={styles.storySection}
          ref={storyRef}
          aria-labelledby="story-heading"
        >
          <div className={styles.storyContainer}>
            <header className={styles.storyHeader}>
              <div className={styles.storyEyebrow}>
                <span className={styles.storyEyebrowDot} aria-hidden="true" />
                Our Journey
              </div>
              <h2 id="story-heading" className={styles.storyHeading}>
                How Our Doors Opened
              </h2>
            </header>

            {/* Desktop: 7 cols ribbon + 5 cols right info */}
            <div className={styles.storyGrid}>
              {/* Large Ribbon Photo (7 cols) */}
              <div className={styles.storyRibbonWrap}>
                <button
                  type="button"
                  className={styles.storyRibbonBtn}
                  onClick={() => openLightbox(0)}
                  aria-label="View Grand Opening ribbon-cutting photo in lightbox"
                >
                  <img
                    src="/gallery/inauguration/inauguration-ribbon-cutting-800.webp"
                    srcSet="/gallery/inauguration/inauguration-ribbon-cutting-400.webp 400w, /gallery/inauguration/inauguration-ribbon-cutting-800.webp 800w, /gallery/inauguration/inauguration-ribbon-cutting-1600.webp 1600w"
                    sizes="(max-width: 960px) 100vw, 58vw"
                    alt="Ribbon-cutting at the entrance during the opening of Marshalign Dental Care, with guests gathered behind"
                    className={styles.storyRibbonImg}
                    loading="lazy"
                    decoding="async"
                    width={1600}
                    height={910}
                  />
                </button>
              </div>

              {/* Right column: label, H2, date chip, description, group photo */}
              <div className={styles.storyInfoCol}>
                <span className={styles.storyLabel}>Our Beginning</span>
                <h3 className={styles.storyTitle}>Grand Opening</h3>

                {inaugurationData.date && (
                  <span className={styles.storyDateChip}>{inaugurationData.date}</span>
                )}

                <p className={styles.storyDesc}>
                  {getRibbonDescription(inaugurationData)}
                </p>

                {/* Group photo smaller (16/10), overlapping/below with fade-up reveal */}
                <div className={styles.storyGroupWrap} data-animate>
                  <button
                    type="button"
                    className={styles.storyGroupBtn}
                    onClick={() => openLightbox(1)}
                    aria-label="View Opening Day Celebration group photo in lightbox"
                  >
                    <img
                      src="/gallery/inauguration/inauguration-group-800.webp"
                      srcSet="/gallery/inauguration/inauguration-group-400.webp 400w, /gallery/inauguration/inauguration-group-800.webp 800w, /gallery/inauguration/inauguration-group-1600.webp 1600w"
                      sizes="(max-width: 960px) 100vw, 40vw"
                      alt="Clinic team, family and guests posing in the reception on opening day"
                      className={styles.storyGroupImg}
                      loading="lazy"
                      decoding="async"
                      width={1600}
                      height={900}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {lightboxIndex !== null && (
            <GalleryLightbox
              items={storyItems}
              activeIndex={lightboxIndex}
              onClose={closeLightbox}
              onNavigate={navigateLb}
            />
          )}
        </section>
      )}
    </>
  );
};

export default About;
