import React, { useEffect, useRef, useState } from 'react';
import styles from './Gallery.module.css';
import { X } from 'lucide-react';
import { TiltedGridHero, type TiltedGridImage } from '@/components/ui/tilted-grid-hero';

const CLINIC_IMAGES = [
  {
    src: '/clinic-reception.jpg',
    alt: 'Marshalign Dental Care reception and patient waiting lounge',
    label: 'Reception & Waiting Lounge',
  },
  {
    src: '/treatment-room.jpg',
    alt: 'Marshalign modern clinical treatment suite',
    label: 'Specialist Treatment Suite',
  },
  {
    src: '/orthodontics-treatment.webp',
    alt: 'Orthodontics and braces operatory',
    label: 'Orthodontics & Braces Operatory',
  },
  {
    src: '/prosthodontics-treatment.webp',
    alt: 'Prosthodontics and smile restoration operatory',
    label: 'Prosthodontics & Rehabilitation',
  },
  {
    src: '/dr-marshal-antony.jpg',
    alt: 'Dr. Marshal Antony M., Specialist in Orthodontics',
    label: 'Dr. Marshal Antony M.',
  },
  {
    src: '/dr-jose-olive.jpg',
    alt: 'Dr. Jose Olive A., Specialist in Prosthodontics',
    label: 'Dr. Jose Olive A.',
  },
  {
    src: '/dental-implant-treatment.webp',
    alt: 'Dental implant operatory and clinical technology',
    label: 'Precision Implantology Suite',
  },
  {
    src: '/dentofacial-orthopedics.webp',
    alt: 'Dentofacial orthopedics consultation and diagnostic care',
    label: 'Dentofacial Diagnostics',
  },
  {
    src: '/teeth-cleaning.webp',
    alt: 'Preventive dental prophylaxis operatory',
    label: 'Preventive Care Suite',
  },
  {
    src: '/restorative-dentistry.webp',
    alt: 'Restorative dentistry and aesthetic restorations',
    label: 'Restorative Dentistry',
  },
];

const Gallery: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [lightboxImg, setLightboxImg] = useState<(typeof CLINIC_IMAGES)[0] | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add(styles.inView);
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImg(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const imagesWithHandlers: TiltedGridImage[] = CLINIC_IMAGES.map((img) => ({
    src: img.src,
    alt: img.alt,
    label: img.label,
    onClick: () => setLightboxImg(img),
  }));

  return (
    <section id="gallery" className={styles.section} ref={sectionRef} aria-labelledby="gallery-heading">
      <div className={styles.container}>
        {/* Dark Editorial Curved Hero Showcase — matching TiltedGridHero Demo style */}
        <div className={styles.heroBox}>
          <TiltedGridHero
            images={imagesWithHandlers}
            speed={4.2}
            tileHeight={32}
            aspectRatio={16 / 9}
            gap={6}
            axis={54}
            curve={80}
            fade={12}
            className={styles.tiltedHero}
          >
            <div className={styles.overlayContent}>
              {/* Top headline area */}
              <div className={styles.headerArea}>
                <div className={styles.tag}>
                  <span className={styles.tagDot} aria-hidden="true" />
                  Clinic Gallery
                </div>
                <h2 id="gallery-heading" className={styles.heading}>
                  Every frame,
                  <br />
                  brought into focus.
                </h2>
              </div>

              {/* Bottom explanatory copy */}
              <div className={styles.bottomArea}>
                <p className={styles.caption}>
                  Images curve in from one edge, flatten out at the centre, then fade away round the other.
                </p>
                <span className={styles.subHint}>
                  A glimpse inside Marshalign Dental Care operatories &amp; specialist suites
                </span>
              </div>
            </div>
          </TiltedGridHero>
        </div>
      </div>

      {/* Lightbox for high-resolution inspection */}
      {lightboxImg && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxImg(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Gallery photo: ${lightboxImg.label}`}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxImg(null)}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg.src} alt={lightboxImg.alt} className={styles.lightboxImg} />
            <p className={styles.lightboxLabel}>{lightboxImg.label}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
