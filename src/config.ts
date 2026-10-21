// WhatsApp configuration
export const WA_NUMBER = '919025655627';
export const WA_MESSAGE = encodeURIComponent(
  'Hello Marshalign Dental Care, I found your website and would like to enquire about your dental treatments. Could you please share more information?'
);
export const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

/**
 * Clinic WhatsApp number in international format without '+'
 * Matches the header phone +91 90256 55627 → 919025655627
 */
export const CLINIC_WHATSAPP = '919025655627';

export const CLINIC_NAME = 'Marshalign Dental Care';
export const CLINIC_TAGLINE = 'Your Smile is precious to us';
export const CLINIC_PHONE = '+91 90256 55627';
export const CLINIC_PHONE_RAW = '+919025655627';
export const CLINIC_ADDRESS = '345, Rajaram Road, Near KK Nagar Bus Terminal, Trichy – 21, Tamil Nadu, India.';
export const CLINIC_MAPS = 'https://maps.google.com/?q=Marshalign+Dental+Care+345+Rajaram+Road+KK+Nagar+Trichy+Tamil+Nadu';
export const CLINIC_INSTAGRAM = 'https://www.instagram.com/marshalign_dental_trichy/';

/**
 * Structured clinic opening hours.
 * Source: Contact page — Mon–Sat: 9:00 AM – 2:00 PM & 5:00 PM – 8:30 PM · Sun: Closed
 * These are used to build the preferred-time <select> options in the enquiry modal.
 */
export const CLINIC_HOURS: { label: string; value: string }[] = [
  { label: 'Morning — 9:00 AM', value: '9:00 AM' },
  { label: 'Morning — 9:30 AM', value: '9:30 AM' },
  { label: 'Morning — 10:00 AM', value: '10:00 AM' },
  { label: 'Morning — 10:30 AM', value: '10:30 AM' },
  { label: 'Morning — 11:00 AM', value: '11:00 AM' },
  { label: 'Morning — 11:30 AM', value: '11:30 AM' },
  { label: 'Morning — 12:00 PM', value: '12:00 PM' },
  { label: 'Morning — 12:30 PM', value: '12:30 PM' },
  { label: 'Morning — 1:00 PM', value: '1:00 PM' },
  { label: 'Morning — 1:30 PM', value: '1:30 PM' },
  { label: 'Evening — 5:00 PM', value: '5:00 PM' },
  { label: 'Evening — 5:30 PM', value: '5:30 PM' },
  { label: 'Evening — 6:00 PM', value: '6:00 PM' },
  { label: 'Evening — 6:30 PM', value: '6:30 PM' },
  { label: 'Evening — 7:00 PM', value: '7:00 PM' },
  { label: 'Evening — 7:30 PM', value: '7:30 PM' },
  { label: 'Evening — 8:00 PM', value: '8:00 PM' },
];

// Verified Google Maps Listing & Reviews Configuration
export const GOOGLE_MAPS_PLACE_ID = 'ChIJwb0GaAOLqjoRIKsLzwdfrPY';
export const GOOGLE_MAPS_CID = '0xf6a75f07cf8baa20';
export const GOOGLE_MAPS_LISTING = 'https://www.google.com/maps/place/Marshalign+Dental+care/@10.7573297,78.6927779,17z/data=!4m6!3m5!1s0x3baa8b036806bdc1:0xf6a75f07cf8baa20!8m2!3d10.7573297!4d78.6927779!16s%2Fg%2F11ydxk2r6c';
export const GOOGLE_WRITE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJwb0GaAOLqjoRIKsLzwdfrPY';
export const GOOGLE_RATING = 5.0;
export const GOOGLE_REVIEW_COUNT = 29;

