/**
 * Clinic configuration — single source of truth for contact, hours, and links.
 * Keep all clinic-wide constants here; do NOT hardcode them in components.
 *
 * Domain: https://marshaligndentalcare.in (production)
 */

/** Canonical production domain — used for canonical URLs, OG tags, sitemap, robots.txt */
export const SITE_URL = 'https://marshaligndentalcare.in';

// ── WhatsApp ──────────────────────────────────────────────────────────────────
/** International WhatsApp number without '+'. Matches +91 90256 55627. */
export const WA_NUMBER = '919025655627';
export const WA_MESSAGE = encodeURIComponent(
  'Hello Marshalign Dental Care, I found your website and would like to enquire about your dental treatments. Could you please share more information?'
);
export const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

/** Alias kept for import-compat with older components */
export const CLINIC_WHATSAPP = WA_NUMBER;

// ── Clinic Identity ───────────────────────────────────────────────────────────
export const CLINIC_NAME    = 'Marshalign Dental Care';
export const CLINIC_TAGLINE = 'Your Smile is precious to us';

// ── Contact ───────────────────────────────────────────────────────────────────
export const CLINIC_PHONE     = '+91 90256 55627';
export const CLINIC_PHONE_RAW = '+919025655627';
export const CLINIC_ADDRESS   = '345, Rajaram Road, Near KK Nagar Bus Terminal, Trichy \u2013 21, Tamil Nadu, India.';
export const CLINIC_MAPS      = 'https://maps.google.com/?q=Marshalign+Dental+Care+345+Rajaram+Road+KK+Nagar+Trichy+Tamil+Nadu';
export const CLINIC_INSTAGRAM = 'https://www.instagram.com/marshalign_dental_trichy/';

/**
 * Structured opening hours for the enquiry modal time selector.
 * Source: Contact page — Mon–Sat: 9:00 AM – 2:00 PM & 5:00 PM – 8:30 PM · Sun: Closed
 */
export const CLINIC_HOURS: { label: string; value: string }[] = [
  { label: 'Morning \u2014 9:00 AM',  value: '9:00 AM'  },
  { label: 'Morning \u2014 9:30 AM',  value: '9:30 AM'  },
  { label: 'Morning \u2014 10:00 AM', value: '10:00 AM' },
  { label: 'Morning \u2014 10:30 AM', value: '10:30 AM' },
  { label: 'Morning \u2014 11:00 AM', value: '11:00 AM' },
  { label: 'Morning \u2014 11:30 AM', value: '11:30 AM' },
  { label: 'Morning \u2014 12:00 PM', value: '12:00 PM' },
  { label: 'Morning \u2014 12:30 PM', value: '12:30 PM' },
  { label: 'Morning \u2014 1:00 PM',  value: '1:00 PM'  },
  { label: 'Morning \u2014 1:30 PM',  value: '1:30 PM'  },
  { label: 'Evening \u2014 5:00 PM',  value: '5:00 PM'  },
  { label: 'Evening \u2014 5:30 PM',  value: '5:30 PM'  },
  { label: 'Evening \u2014 6:00 PM',  value: '6:00 PM'  },
  { label: 'Evening \u2014 6:30 PM',  value: '6:30 PM'  },
  { label: 'Evening \u2014 7:00 PM',  value: '7:00 PM'  },
  { label: 'Evening \u2014 7:30 PM',  value: '7:30 PM'  },
  { label: 'Evening \u2014 8:00 PM',  value: '8:00 PM'  },
];

// Verified Google Maps Listing & Reviews Configuration
export const GOOGLE_MAPS_PLACE_ID = 'ChIJwb0GaAOLqjoRIKsLzwdfrPY';
export const GOOGLE_MAPS_CID = '0xf6a75f07cf8baa20';
export const GOOGLE_MAPS_LISTING = 'https://www.google.com/maps/place/Marshalign+Dental+care/@10.7573297,78.6927779,17z/data=!4m6!3m5!1s0x3baa8b036806bdc1:0xf6a75f07cf8baa20!8m2!3d10.7573297!4d78.6927779!16s%2Fg%2F11ydxk2r6c';
export const GOOGLE_WRITE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJwb0GaAOLqjoRIKsLzwdfrPY';
export const GOOGLE_RATING = 5.0;
export const GOOGLE_REVIEW_COUNT = 29;

