import React, { useEffect, useRef, useState } from 'react';
import styles from './Gallery.module.css';
import { X, ZoomIn } from 'lucide-react';

const galleryItems = [
  { id: 'reception', src: '/clinic-reception.jpg', alt: 'Marshalign Dental Care reception area', label: 'Reception' },
  { id: 'treatment-1', src: '/orthodontics-treatment.webp', alt: 'Orthodontics operatory at Marshalign Dental Care', label: 'Orthodontics Suite' },
  { id: 'treatment-2', src: '/prosthodontics-treatment.webp', alt: 'Prosthodontics treatment at Marshalign Dental Care', label: 'Prosthodontics Suite' },
  { id: 'doctor-1', src: '/dr-marshal-antony.jpg', alt: 'Dr. Marshal Antony M., Orthodontist', label: 'Dr. Marshal Antony M.' },
  { id: 'doctor-2', src: '/dr-jose-olive.jpg', alt: 'Dr. Jose Olive A., Prosthodontist', label: 'Dr. Jose Olive A.' },
  { id: 'clinic-env', src: '/dental-implant-treatment.webp', alt: 'Dental implant clinical operatory at Marshalign Dental Care', label: 'Implantology Suite' },
];

const Gallery: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [lightboxImg, setLightboxImg] = useState<(typeof galleryItems)[0] | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add(styles.inView); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxImg(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <section id="gallery" className={styles.section} ref={sectionRef} aria-labelledby="gallery-heading">
      <div className={styles.container}>
        <div className={styles.header} data-animate>
          <div className={styles.tag}>
            <span className={styles.tagDot} aria-hidden="true" /> Clinic Gallery
          </div>
          <h2 id="gallery-heading" className={styles.heading}>
            A glimpse inside<br />
            <span className={styles.headingAccent}>Marshalign.</span>
          </h2>
          <p className={styles.note}>
            A tour of our modern clinical operatories, specialist doctors, and patient care environments.
          </p>
        </div>

        <div className={styles.grid}>
          {galleryItems.map((item, i) => (
            <button
              key={item.id}
              className={styles.item}
              data-animate
              style={{ transitionDelay: `${i * 0.07}s` }}
              onClick={() => setLightboxImg(item)}
              aria-label={`View larger: ${item.label}`}
            >
              <img src={item.src} alt={item.alt} loading="lazy" className={styles.img} />
              <div className={styles.itemOverlay} aria-hidden="true">
                <ZoomIn size={24} className={styles.zoomIcon} />
                <span className={styles.itemLabel}>{item.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxImg(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Lightbox: ${lightboxImg.label}`}
        >
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxImg(null)}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImg.src}
            alt={lightboxImg.alt}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <p className={styles.lightboxLabel}>{lightboxImg.label}</p>
        </div>
      )}
    </section>
  );
};

export default Gallery;
