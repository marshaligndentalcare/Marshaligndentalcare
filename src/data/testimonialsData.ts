import { GOOGLE_MAPS_LISTING } from '../config';

export interface VerifiedGoogleReview {
  id: string;
  authorName: string;
  initials: string;
  rating: number;
  relativeDate: string;
  text: string;
  source: 'Google Maps Review';
  sourceUrl: string;
  verified: boolean;
  authorBadge?: string;
}

/**
 * 10 Genuine, verified Google reviews directly from the official Marshalign Dental Care Google Maps listing:
 * Location: 345, Rajaram Rd, K K Nagar, Tiruchirappalli, Tamil Nadu 620021
 * Listing CID: 0xf6a75f07cf8baa20 | Rating: 5.0 / 5.0 (29 reviews)
 * Verified against live Google Maps Business Profile.
 */
export const VERIFIED_REVIEWS: VerifiedGoogleReview[] = [
  {
    id: 'google-rev-sam',
    authorName: 'Sam',
    initials: 'S',
    rating: 5,
    relativeDate: '5 months ago',
    text: 'Visited for orthodontics correction, treatment was well planned and executed. Satisfactory results achieved in 6 months. I will highly recommend for treatment in and around trichy',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
  {
    id: 'google-rev-sukanya',
    authorName: 'Sukanya B',
    initials: 'SB',
    rating: 5,
    relativeDate: 'a year ago',
    text: 'Doctor is very kind and friendly and got a service in reasonably rate and gave practical solutions which is more helpful and in budget',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
  {
    id: 'google-rev-devasena',
    authorName: 'DEVASENA KULANDAIVEL',
    initials: 'DK',
    rating: 5,
    relativeDate: '2 months ago',
    text: 'The best dental clinic i have visited and doctors are patient and treatment is accurate and neat.',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
  {
    id: 'google-rev-arul',
    authorName: 'Arul Selvaraj',
    initials: 'AS',
    rating: 5,
    relativeDate: '9 months ago',
    text: 'Excellent. Affordable. Two root canel & cap done 👍',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
  {
    id: 'google-rev-josephine',
    authorName: 'Josephine Ruby',
    initials: 'JR',
    rating: 5,
    relativeDate: 'a year ago',
    text: 'I had an excellent experience here. Doctr was friendly and courteous, ensuring each visit was comfortable. Doctr took time to explain procedures clearly, answered all my questions, and provided honest advice. The clinic was clean, modern, and well-equipped, which gave me confidence in their services. My dental treatment, including cleaning and tooth replacement, was thorough and pain-free. I would highly recommend their services to anyone seeking professional and affordable dental care',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
  {
    id: 'google-rev-narayanan',
    authorName: 'Dr Narayanan',
    initials: 'DN',
    rating: 5,
    relativeDate: 'a year ago',
    authorBadge: 'Local Guide',
    text: 'Received painless implant treatment for my wife at Marshalign Dental Care, Trichy. Very much happy with the treatment procedure and I highly suggest this clinic for your future dental problems.',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
  {
    id: 'google-rev-irudayaraj',
    authorName: 'Irudayaraj Amirtham',
    initials: 'IA',
    rating: 5,
    relativeDate: 'a year ago',
    authorBadge: 'Local Guide',
    text: 'The best dental around the corner, support staff are very helpful, available around the clock. More economical with high precision.',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
  {
    id: 'google-rev-maria',
    authorName: 'Maria Jeswin .J',
    initials: 'MJ',
    rating: 5,
    relativeDate: '2 months ago',
    text: 'Very good treatment with affordable charge, good follow up treatment.',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
  {
    id: 'google-rev-hari',
    authorName: 'hari krishnan',
    initials: 'HK',
    rating: 5,
    relativeDate: 'a year ago',
    text: 'Received painless treatment at reasonable price. Dr Marshal is polite and friendly',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
  {
    id: 'google-rev-shabu',
    authorName: 'Shabu Rakshu',
    initials: 'SR',
    rating: 5,
    relativeDate: 'a year ago',
    text: 'Iam fully satisfied and also recenable cost thankyou so much sir',
    source: 'Google Maps Review',
    sourceUrl: GOOGLE_MAPS_LISTING,
    verified: true,
  },
];

// Helper to filter and provide strictly verified reviews for production display
export const getVerifiedTestimonials = (): VerifiedGoogleReview[] => {
  return VERIFIED_REVIEWS.filter((review) => review.verified);
};
