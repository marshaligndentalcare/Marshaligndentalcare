/**
 * SpecialistProfilePage.tsx — Individual doctor profile page.
 * Route: /specialists/:slug
 *
 * Shows full profile for primary doctors; compact profile for consultants.
 * Hides empty sections gracefully. Uses same tokens as Specialists component.
 *
 * JSON-LD is injected via useEffect to comply with AGENTS.md no-dangerouslySetInnerHTML rule.
 */
import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSEO } from '../lib/seo';
import styles from './SpecialistProfilePage.module.css';
import WhatsAppCTA from '../components/WhatsAppCTA';
import { DOCTORS } from '../data/doctors';
import type { Doctor } from '../data/doctors';

// ── JSON-LD physician schema ──────────────────────────────────────────────

function buildJsonLd(doc: Doctor): string {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doc.name,
    jobTitle: doc.role,
    image: `https://marshaligndentalcare.in${doc.photo.w900}`,
    worksFor: {
      '@type': 'MedicalOrganization',
      name: 'Marshalign Dental Care',
      url: 'https://marshaligndentalcare.in',
    },
  };
  if (doc.memberships.length > 0) {
    schema.memberOf = doc.memberships.map(m => ({ '@type': 'Organization', name: m }));
  }
  return JSON.stringify(schema);
}

// ── Profile component ─────────────────────────────────────────────────────

const SpecialistProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const doc = DOCTORS.find(d => d.slug === slug && d.visible);

  // Always call hooks unconditionally before any early return
  const title = doc
    ? `${doc.displayName} | ${doc.role} | Marshalign Dental Care, Trichy`
    : '404 | Marshalign Dental Care';
  const desc = doc?.short_bio ?? '';

  useSEO({
    title,
    description: desc,
    canonical: `/specialists/${slug ?? ''}`,
  });

  // Inject JSON-LD schema via useEffect (avoids dangerouslySetInnerHTML)
  React.useEffect(() => {
    if (!doc) return;
    const existing = document.getElementById(`jsonld-physician-${doc.slug}`);
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = `jsonld-physician-${doc.slug}`;
    script.type = 'application/ld+json';
    script.textContent = buildJsonLd(doc);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [doc]);

  if (!doc) return <Navigate to="/specialists" replace />;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/specialists">Specialists</Link></li>
            <li aria-current="page">{doc.displayName}</li>
          </ol>
        </nav>

        <div className={styles.profileGrid}>
          {/* Photo column */}
          <div className={styles.photoCol}>
            <picture>
              <source
                srcSet={`${doc.photo.w900} 900w, ${doc.photo.w450} 450w`}
                sizes="(max-width: 600px) 100vw, 400px"
                type="image/webp"
              />
              <img
                src={doc.photo.w900}
                alt={doc.alt}
                width={450}
                height={600}
                className={styles.photo}
                style={{ objectPosition: `${doc.focal_x} ${doc.focal_y}` }}
                loading="eager"
                decoding="async"
              />
            </picture>
            {doc.tier === 'consultant' && (
              <div className={styles.consultantBadge}>Consultant</div>
            )}
          </div>

          {/* Info column */}
          <div className={styles.infoCol}>
            <h1 className={styles.name}>{doc.displayName}</h1>
            {doc.qualifications && (
              <p className={styles.qualifications}>{doc.qualifications}</p>
            )}
            <p className={styles.role}>{doc.role}</p>
            {doc.specialtyLine && (
              <span className={styles.specialtyChip}>{doc.specialtyLine}</span>
            )}
            {doc.short_bio && (
              <p className={styles.bio}>{doc.short_bio}</p>
            )}
            {doc.long_bio && (
              <p className={styles.bio}>{doc.long_bio}</p>
            )}
            {doc.memberships.length > 0 && (
              <div className={styles.membershipsSection}>
                <h2 className={styles.sectionLabel}>Memberships</h2>
                <ul className={styles.membershipList}>
                  {doc.memberships.map(m => (
                    <li key={m} className={styles.membershipChip}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {doc.registrationNo && (
              <p className={styles.regNo}>Registration No: {doc.registrationNo}</p>
            )}

            <div className={styles.ctaRow}>
              <WhatsAppCTA
                label={`Enquire with ${doc.enquiryName}`}
                size="md"
                variant="primary"
                context={{ type: 'doctor', doctorName: doc.enquiryName }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SpecialistProfilePage;
