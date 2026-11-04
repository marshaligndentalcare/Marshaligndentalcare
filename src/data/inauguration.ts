/**
 * src/data/inauguration.ts
 *
 * Inauguration event data for the Grand Opening photo series.
 *
 * PRIVACY GATE:
 *   Both inauguration photos are shown ONLY when:
 *     import.meta.env.DEV === true  (local dev)
 *   OR
 *     consentConfirmed === true     (clinic has given written OK)
 *
 * To publish: flip consentConfirmed to true after the clinic confirms
 *   the exact guest name/title and gives written consent.
 *
 * Fields left blank (guestName, guestTitle) will omit those lines from the UI.
 * The description template switches automatically based on guestTitle presence.
 */

export interface InaugurationData {
  /** ISO 8601 date string, e.g. "2024-11-01". Leave empty string if not confirmed. */
  date: string;
  /** Guest of honour's name, e.g. "Dr. P. Suresh". Leave empty if not confirmed. */
  guestName: string;
  /** Guest of honour's title/designation, e.g. "Dean, XYZ Dental College". Leave empty if not confirmed. */
  guestTitle: string;
  /** Set to true only after the clinic gives written confirmation of name, title, and consent. */
  consentConfirmed: boolean;
}

export const inaugurationData: InaugurationData = {
  date:             '',   // ACTION REQUIRED: fill in after clinic confirms
  guestName:        '',   // ACTION REQUIRED: fill in after clinic confirms
  guestTitle:       '',   // ACTION REQUIRED: fill in after clinic confirms
  consentConfirmed: false, // ACTION REQUIRED: set to true after written consent
};

/**
 * Returns the description string for the ribbon-cutting photo.
 * Switches between the guest-named and fallback variant based on guestTitle.
 */
export function getRibbonDescription(data: InaugurationData): string {
  if (data.guestTitle) {
    const guestRef = data.guestName
      ? `${data.guestTitle}, ${data.guestName}`
      : data.guestTitle;
    return `The day our doors opened. We were honoured to have ${guestRef} inaugurate Marshalign Dental Care, surrounded by family, friends and well-wishers. Thank you for the blessings, we are truly happy and grateful.`;
  }
  return 'The day our doors opened. Surrounded by family, friends and well-wishers, we cut the ribbon on Marshalign Dental Care. Thank you for the blessings, we are truly happy and grateful.';
}

export const GROUP_DESCRIPTION =
  'Smiles all around on our opening day, with our team, family and guests together in the reception. A day we will always remember.';

/** True if inauguration photos should be shown (dev mode or consent confirmed). */
export function inaugurationsVisible(data: InaugurationData): boolean {
  return import.meta.env.DEV || data.consentConfirmed;
}

