/**
 * clinic.ts — Single source of truth for all clinic facts.
 * Import from here in every component. Do NOT hardcode clinic data elsewhere.
 *
 * To update: edit only this file, then `npm run build` to verify.
 */

// ── Domain & URLs ─────────────────────────────────────────────────────────────
/** Real production domain. Used for canonical links, OG tags, sitemaps. */
export const SITE_URL = 'https://marshaligndentalcare.in';

// ── Clinic Identity ───────────────────────────────────────────────────────────
export const CLINIC_NAME    = 'Marshalign Dental Care';
export const CLINIC_TAGLINE = 'Your Smile is precious to us';

// ── Contact ───────────────────────────────────────────────────────────────────
/** Display-formatted phone number */
export const CLINIC_PHONE     = '+91 90256 55627';
/** E.164 format for tel: links */
export const CLINIC_PHONE_RAW = '+919025655627';
/** International WhatsApp number without '+' — same as the clinic phone */
export const CLINIC_WHATSAPP  = '919025655627';

// ── WhatsApp shortlinks (kept for backward compat; built from CLINIC_WHATSAPP) ─
export const WA_NUMBER = CLINIC_WHATSAPP;
export const WA_MESSAGE = encodeURIComponent(
  'Hello Marshalign Dental Care, I found your website and would like to enquire about your dental treatments. Could you please share more information?'
);
export const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

// ── Location ──────────────────────────────────────────────────────────────────
export const CLINIC_ADDRESS =
  '345, Rajaram Road, Near KK Nagar Bus Terminal, Trichy \u2013 21, Tamil Nadu, India.';

export const CLINIC_MAPS =
  'https://maps.google.com/?q=Marshalign+Dental+Care+345+Rajaram+Road+KK+Nagar+Trichy+Tamil+Nadu';

// ── Social ────────────────────────────────────────────────────────────────────
export const CLINIC_INSTAGRAM = 'https://www.instagram.com/marshalign_dental_trichy/';

// ── Opening Hours ─────────────────────────────────────────────────────────────
/**
 * Human-readable opening hours string (used in Contact section and FAQ).
 * SOURCE: as displayed on clinic contact section — confirm with CLIENT_CONFIRMATIONS item 5.
 */
export const CLINIC_HOURS_DISPLAY = 'Mon\u2013Sat: 9:00 AM \u2013 2:00 PM & 5:00 PM \u2013 8:30 PM \u00b7 Sun: Closed';

/**
 * Structured hours for enquiry modal time selector.
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

// ── Doctors ───────────────────────────────────────────────────────────────────
/**
 * Doctors data — verified facts only.
 * BDS, MDS for Dr. Marshal is confirmed.
 * Dr. Jose's full qualifications pending CLIENT_CONFIRMATIONS item 1.
 */
export const DOCTORS = [
  {
    id: 'dr-marshal',
    name: 'Dr. Marshal Antony M.',
    /** Confirmed qualification — BDS, MDS (Orthodontics & Dentofacial Orthopedics) */
    degrees: 'BDS, MDS (Orthodontics & Dentofacial Orthopedics)',
    specialty: 'Orthodontics & Dentofacial Orthopedics',
    /** He/him */
    pronouns: 'he' as const,
  },
  {
    id: 'dr-jose',
    name: 'Dr. Jose Olive A.',
    /** Qualifications pending client confirmation — do NOT invent */
    degrees: 'Prosthodontics & Implantology',
    specialty: 'Prosthodontics & Implantology',
    /** She/her — confirmed by client brief */
    pronouns: 'she' as const,
  },
] as const;

// ── Google Maps / Reviews ─────────────────────────────────────────────────────
export const GOOGLE_MAPS_PLACE_ID    = 'ChIJwb0GaAOLqjoRIKsLzwdfrPY';
export const GOOGLE_MAPS_CID         = '0xf6a75f07cf8baa20';
export const GOOGLE_MAPS_LISTING     =
  'https://www.google.com/maps/place/Marshalign+Dental+care/@10.7573297,78.6927779,17z/data=!4m6!3m5!1s0x3baa8b036806bdc1:0xf6a75f07cf8baa20!8m2!3d10.7573297!4d78.6927779!16s%2Fg%2F11ydxk2r6c';
export const GOOGLE_WRITE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJwb0GaAOLqjoRIKsLzwdfrPY';
export const GOOGLE_RATING       = 5.0;
export const GOOGLE_REVIEW_COUNT = 29;
