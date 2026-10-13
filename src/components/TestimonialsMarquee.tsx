import React from 'react';
import { Star, ExternalLink, PenLine } from 'lucide-react';
import {
  GOOGLE_MAPS_LISTING,
  GOOGLE_WRITE_REVIEW_URL,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
} from '../config';
import {
  VERIFIED_REVIEWS,
  type VerifiedGoogleReview,
} from '../data/testimonialsData';
import styles from './TestimonialsMarquee.module.css';

// Official Google "G" icon SVG
const GoogleGIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    className={className}
    aria-hidden="true"
  >
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.37 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.63 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

interface TestimonialCardProps {
  review: VerifiedGoogleReview;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ review }) => {
  return (
    <article
      className={styles.card}
      aria-label={`Review by ${review.authorName}, rated ${review.rating} out of 5 stars`}
    >
      <div className={styles.cardTop}>
        <div className={styles.sourceBadge}>
          <GoogleGIcon className={styles.googleGIcon} />
          <span>Google Review</span>
        </div>
        <div
          className={styles.ratingStars}
          role="img"
          aria-label={`${review.rating} out of 5 stars`}
        >
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star key={i} size={15} fill="#F59E0B" stroke="#F59E0B" aria-hidden="true" />
          ))}
        </div>
      </div>

      <div className={styles.quoteWrapper}>
        <p className={styles.quoteText}>&ldquo;{review.text}&rdquo;</p>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.reviewerProfile}>
          <div className={styles.avatarCircle} aria-hidden="true">
            {review.initials}
          </div>
          <div className={styles.reviewerDetails}>
            <span className={styles.reviewerName}>{review.authorName}</span>
            <div className={styles.reviewerMeta}>
              {review.authorBadge && (
                <span className={styles.badgeLocalGuide}>
                  {review.authorBadge} ·{' '}
                </span>
              )}
              <span>{review.relativeDate}</span>
            </div>
          </div>
        </div>

        <a
          href={review.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewReviewLink}
          aria-label={`View ${review.authorName}'s review on Google Maps`}
          title="View on Google Maps"
        >
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};

export const TestimonialsMarquee: React.FC = () => {
  // 10 genuine, verified Google reviews partitioned across two rows
  // Row 1 and Row 2 have completely different sets of unique reviews.
  const rowOneItems = [
    VERIFIED_REVIEWS[0], // Sam
    VERIFIED_REVIEWS[1], // Sukanya B
    VERIFIED_REVIEWS[2], // DEVASENA KULANDAIVEL
    VERIFIED_REVIEWS[3], // Arul Selvaraj
    VERIFIED_REVIEWS[4], // Josephine Ruby
  ];

  const rowTwoItems = [
    VERIFIED_REVIEWS[5], // Dr Narayanan (Local Guide)
    VERIFIED_REVIEWS[6], // Irudayaraj Amirtham (Local Guide)
    VERIFIED_REVIEWS[7], // Maria Jeswin .J
    VERIFIED_REVIEWS[8], // hari krishnan
    VERIFIED_REVIEWS[9], // Shabu Rakshu
  ];

  return (
    <section
      id="testimonials"
      className={styles.section}
      aria-labelledby="testimonials-heading"
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            <span>Verified Patient Reviews</span>
          </div>

          <h2 id="testimonials-heading" className={styles.heading}>
            Patient Experiences
          </h2>

          <p className={styles.subheading}>
            Read feedback shared by people who have reviewed their experience with Marshalign Dental Care.
          </p>

          {/* Trust Score Pill */}
          <div className={styles.trustPill}>
            <span className={styles.googleIconSmall}>
              <GoogleGIcon />
            </span>
            <span className={styles.trustScore}>{GOOGLE_RATING.toFixed(1)}</span>
            <div className={styles.starsRow} role="img" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={15} fill="#F59E0B" stroke="#F59E0B" aria-hidden="true" />
              ))}
            </div>
            <span className={styles.trustDivider} aria-hidden="true">|</span>
            <span className={styles.trustCount}>
              {GOOGLE_REVIEW_COUNT} Reviews on Google
            </span>
          </div>
        </div>
      </div>

      {/* Marquee Dual-Row Grid */}
      <div
        className={styles.marqueeContainer}
        aria-label="Horizontally scrolling patient reviews"
      >
        <div className={styles.edgeOverlayLeft} aria-hidden="true" />
        <div className={styles.edgeOverlayRight} aria-hidden="true" />

        {/* Row 1 - Scrolling Left */}
        <div
          className={styles.marqueeRow}
          tabIndex={0}
          role="region"
          aria-label="Recent patient reviews - row 1. Hover or focus to pause scrolling."
        >
          <div className={`${styles.marqueeTrack} ${styles.trackScrollLeft}`}>
            {/* First sequence */}
            {rowOneItems.map((review, idx) => (
              <TestimonialCard
                key={`r1-a-${review.id}-${idx}`}
                review={review}
                index={idx}
              />
            ))}
            {/* Duplicated sequence for seamless infinite loop */}
            {rowOneItems.map((review, idx) => (
              <TestimonialCard
                key={`r1-b-${review.id}-${idx}`}
                review={review}
                index={idx}
              />
            ))}
          </div>
        </div>

        {/* Row 2 - Scrolling Right / Distinct Pace */}
        <div
          className={styles.marqueeRow}
          tabIndex={0}
          role="region"
          aria-label="Recent patient reviews - row 2. Hover or focus to pause scrolling."
        >
          <div className={`${styles.marqueeTrack} ${styles.trackScrollRight}`}>
            {/* First sequence */}
            {rowTwoItems.map((review, idx) => (
              <TestimonialCard
                key={`r2-a-${review.id}-${idx}`}
                review={review}
                index={idx}
              />
            ))}
            {/* Duplicated sequence for seamless infinite loop */}
            {rowTwoItems.map((review, idx) => (
              <TestimonialCard
                key={`r2-b-${review.id}-${idx}`}
                review={review}
                index={idx}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review Actions */}
      <div className={styles.container}>
        <div className={styles.actionsWrapper}>
          <div className={styles.actionsGroup}>
            <a
              href={GOOGLE_MAPS_LISTING}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryAction}
              aria-label="Read more Google reviews for Marshalign Dental Care on Google Maps (opens in a new tab)"
            >
              <span>Read More Google Reviews</span>
              <ExternalLink size={16} aria-hidden="true" />
            </a>

            <a
              href={GOOGLE_WRITE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryAction}
              aria-label="Write a Google review for Marshalign Dental Care (opens in a new tab)"
            >
              <PenLine size={16} aria-hidden="true" />
              <span>Write a Google Review</span>
            </a>
          </div>

          <p className={styles.subActionNote}>
            Verified reviews from Marshalign Dental Care&rsquo;s official Google Business Profile in Tiruchirappalli.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsMarquee;
