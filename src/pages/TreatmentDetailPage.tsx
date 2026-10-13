import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { useSEO } from '../lib/seo';
import { getTreatmentBySlug, TREATMENTS } from '../data/treatmentsData';
import Breadcrumbs from '../components/Breadcrumbs';
import WhatsAppCTA from '../components/WhatsAppCTA';
import styles from './TreatmentDetailPage.module.css';

const TreatmentDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const treatment = slug ? getTreatmentBySlug(slug) : undefined;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useSEO({
    title: treatment ? treatment.pageTitle : 'Treatment | Marshalign Dental Care',
    description: treatment ? treatment.metaDescription : 'Specialist dental treatment at Marshalign Dental Care, Trichy.',
    canonical: treatment ? `/treatments/${treatment.slug}` : '/treatments',
    ogImage: treatment ? treatment.image : undefined,
  });

  // If treatment not found, redirect to 404
  if (!treatment) {
    return <Navigate to="/404" replace />;
  }

  // Get related treatments (exclude current)
  const relatedTreatments = TREATMENTS.filter((t) => t.id !== treatment.id).slice(0, 3);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Treatments', to: '/treatments' },
          { label: treatment.name },
        ]}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.tag}>
              <span className={styles.tagDot} aria-hidden="true" />
              {treatment.specialty}
            </div>
            <h1 className={styles.heroTitle}>{treatment.name}</h1>
            <p className={styles.heroSubtitle}>{treatment.heroSubtitle}</p>
            <div className={styles.heroCta}>
              <WhatsAppCTA
                label={`Enquire about ${treatment.name}`}
                size="lg"
                context={{ type: 'service', serviceName: treatment.name }}
              />
            </div>
          </div>
          <div className={styles.heroImage}>
            <img
              src={treatment.image}
              alt={treatment.alt}
              className={styles.heroImg}
              loading="eager"
              decoding="async"
            />
            <div className={styles.heroImgOverlay} aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <p className={styles.overview}>{treatment.overview}</p>
        </div>
      </section>

      {/* Benefits */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Benefits</h2>
          <ul className={styles.benefitList}>
            {treatment.benefits.map((benefit, i) => (
              <li key={i} className={styles.benefitItem}>
                <span className={styles.benefitIcon} aria-hidden="true">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Procedure */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What to Expect</h2>
          <ol className={styles.procedureList}>
            {treatment.procedure.map((step, i) => (
              <li key={i} className={styles.procedureItem}>
                <span className={styles.stepNumber}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.stepText}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Who Is It For */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Who Is This Treatment For?</h2>
          <p className={styles.overview}>{treatment.whoIsItFor}</p>
        </div>
      </section>

      {/* FAQ */}
      {treatment.faq.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {treatment.faq.map((item, i) => (
                <div
                  key={i}
                  className={`${styles.faqItem} ${openFaq === i ? styles.faqItemOpen : ''}`}
                >
                  <button
                    type="button"
                    className={styles.faqTrigger}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{item.question}</span>
                    <span className={styles.faqIcon} aria-hidden="true">
                      {openFaq === i ? <FaMinus /> : <FaPlus />}
                    </span>
                  </button>
                  <div
                    className={styles.faqAnswer}
                    aria-hidden={openFaq !== i}
                  >
                    <p className={styles.faqAnswerText}>{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>
              Interested in {treatment.name}?
            </h2>
            <p className={styles.ctaText}>
              Send us an enquiry and our team will get back to you promptly.
            </p>
            <WhatsAppCTA
              label={`Enquire about ${treatment.name}`}
              size="lg"
              context={{ type: 'service', serviceName: treatment.name }}
            />
          </div>
        </div>
      </section>

      {/* Related Treatments */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Other Treatments</h2>
          <div className={styles.relatedGrid}>
            {relatedTreatments.map((t) => (
              <Link
                key={t.id}
                to={`/treatments/${t.slug}`}
                className={styles.relatedCard}
              >
                <img
                  src={t.image}
                  alt={t.alt}
                  className={styles.relatedImg}
                  loading="lazy"
                  decoding="async"
                />
                <div className={styles.relatedInfo}>
                  <h3 className={styles.relatedName}>{t.name}</h3>
                  <p className={styles.relatedSpecialty}>{t.specialty}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default TreatmentDetailPage;
