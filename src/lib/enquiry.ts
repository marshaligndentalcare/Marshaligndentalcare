/**
 * lib/enquiry.ts
 * Pure functions for building and validating the appointment enquiry form.
 * No side-effects, no browser APIs — safe to unit-test in Node.
 */

import { CLINIC_WHATSAPP } from '../config';

// ── Types ────────────────────────────────────────────────────────────────────

export interface EnquiryFormValues {
  name: string;
  phone: string;
  location: string;
  treatment: string;
  date: string;      // ISO date string yyyy-mm-dd
  time: string;
  note: string;
}

export interface EnquiryFormErrors {
  name?: string;
  phone?: string;
  location?: string;
  treatment?: string;
  date?: string;
  time?: string;
  note?: string;
}

// ── Phone normalisation ───────────────────────────────────────────────────────

/**
 * Normalises an Indian mobile number to a clean 10-digit string.
 * Accepts: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX, spaces/dashes.
 * Returns the 10-digit number or null if it doesn't look valid.
 */
export function normaliseIndianPhone(raw: string): string | null {
  // Strip all non-digit characters
  const digits = raw.replace(/\D/g, '');

  // Handle country code variants
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  if (digits.length === 10) {
    return digits;
  }
  return null;
}

/**
 * Returns true if the 10-digit number is a plausible Indian mobile number.
 * Indian mobile numbers start with 6, 7, 8, or 9.
 */
export function isValidIndianMobile(tenDigits: string): boolean {
  return /^[6-9]\d{9}$/.test(tenDigits);
}

// ── Date formatting ───────────────────────────────────────────────────────────

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats an ISO date (yyyy-mm-dd) as "Weekday, DD Mon YYYY".
 * Example: "2024-12-25" → "Wednesday, 25 Dec 2024"
 * Uses UTC to avoid timezone-induced off-by-one-day errors with date inputs.
 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  // Construct as UTC to avoid local-timezone shift
  const dt = new Date(Date.UTC(y, m - 1, d));
  const weekday = WEEKDAYS[dt.getUTCDay()];
  const day     = String(dt.getUTCDate()).padStart(2, '0');
  const month   = MONTHS[dt.getUTCMonth()];
  const year    = dt.getUTCFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

// ── Today's date (for min= on date input) ────────────────────────────────────

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// ── Message builder ───────────────────────────────────────────────────────────

/**
 * Builds the appointment-request WhatsApp message from form values.
 * Uses %0A for line breaks so encodeURIComponent doesn't double-encode them.
 *
 * Final URL: https://wa.me/<CLINIC_WHATSAPP>?text=<encoded>
 * Target length: well under 2 000 characters even with a 200-char note.
 */
export function buildEnquiryMessage(values: EnquiryFormValues): string {
  const normalized = normaliseIndianPhone(values.phone) ?? values.phone.trim();
  const displayPhone = `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
  const formattedDate = formatDate(values.date);

  const lines: string[] = [
    `Hello Marshalign Dental Care,`,
    `I'm ${values.name.trim()} from ${values.location.trim()}.`,
    `I'd like to book an appointment for ${values.treatment} on ${formattedDate} at ${values.time}. Is this slot available?`,
    `My phone number: ${displayPhone}`,
  ];

  if (values.note.trim()) {
    lines.push(`Note: ${values.note.trim()}`);
  }

  return lines.join('\n');
}

/**
 * Builds the full wa.me URL. Safe to open directly (popup-blocker-friendly
 * when called inside a click handler).
 */
export function buildEnquiryURL(values: EnquiryFormValues): string {
  const message = buildEnquiryMessage(values);
  return `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateEnquiryForm(values: EnquiryFormValues): EnquiryFormErrors {
  const errors: EnquiryFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your full name.';
  }

  const phone10 = normaliseIndianPhone(values.phone);
  if (!phone10) {
    errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
  } else if (!isValidIndianMobile(phone10)) {
    errors.phone = 'Mobile number must start with 6, 7, 8, or 9.';
  }

  if (!values.location.trim()) {
    errors.location = 'Please enter your area or locality.';
  }

  if (!values.treatment) {
    errors.treatment = 'Please select a treatment.';
  }

  if (!values.date) {
    errors.date = 'Please select a preferred date.';
  } else if (values.date < todayISO()) {
    errors.date = 'Date cannot be in the past.';
  }

  if (!values.time) {
    errors.time = 'Please select a preferred time.';
  }

  if (values.note.length > 200) {
    errors.note = `Note must be 200 characters or fewer (currently ${values.note.length}).`;
  }

  return errors;
}
