/**
 * enquiry.test.ts
 * Unit tests for src/lib/enquiry.ts
 *
 * Run with: node --experimental-vm-modules scripts/run-tests.mjs
 * Or directly: node --import tsx/esm src/lib/enquiry.test.ts
 *
 * These tests use only Node built-ins — no test framework required.
 * They're also safe to run via Vitest or Jest.
 */

import {
  normaliseIndianPhone,
  isValidIndianMobile,
  formatDate,
  buildEnquiryMessage,
  buildEnquiryURL,
  validateEnquiryForm,
} from './enquiry';

// ── Simple assertion helper ───────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ✓  ${message}`);
    passed++;
  } else {
    console.error(`  ✗  FAIL: ${message}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  FAIL: ${label}`);
    console.error(`       expected: ${JSON.stringify(expected)}`);
    console.error(`       actual  : ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── normaliseIndianPhone ──────────────────────────────────────');

assertEqual(normaliseIndianPhone('+91 90256 55627'), '9025655627', '+91 with spaces');
assertEqual(normaliseIndianPhone('919025655627'),    '9025655627', '12-digit with 91 prefix');
assertEqual(normaliseIndianPhone('09025655627'),     '9025655627', '11-digit with 0 prefix');
assertEqual(normaliseIndianPhone('9025655627'),      '9025655627', '10-digit clean');
assertEqual(normaliseIndianPhone('90256-55627'),     '9025655627', '10-digit with dash');
assertEqual(normaliseIndianPhone('90256 55627'),     '9025655627', '10-digit with space');
assertEqual(normaliseIndianPhone('+919025655627'),   '9025655627', '+91 no space');
assertEqual(normaliseIndianPhone('123'),             null,          'too short → null');
assertEqual(normaliseIndianPhone('12345678901234'), null,          'too long → null');

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── isValidIndianMobile ────────────────────────────────────────');

assert(isValidIndianMobile('9025655627'),  'valid 9xxx');
assert(isValidIndianMobile('8025655627'),  'valid 8xxx');
assert(isValidIndianMobile('7025655627'),  'valid 7xxx');
assert(isValidIndianMobile('6025655627'),  'valid 6xxx');
assert(!isValidIndianMobile('1234567890'), 'rejects 1xxx');
assert(!isValidIndianMobile('5234567890'), 'rejects 5xxx');
assert(!isValidIndianMobile('902565562'),  'rejects 9-digit');

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── formatDate ─────────────────────────────────────────────────');

assertEqual(formatDate('2024-12-25'), 'Wednesday, 25 Dec 2024', 'Christmas 2024');
assertEqual(formatDate('2025-01-01'), 'Wednesday, 01 Jan 2025', 'New Year 2025');
assertEqual(formatDate('2024-02-29'), 'Thursday, 29 Feb 2024',  'Leap day 2024');
assertEqual(formatDate('2026-10-19'), 'Monday, 19 Oct 2026',    'Oct 2026');

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── buildEnquiryMessage ────────────────────────────────────────');

const base = {
  name: 'Priya Lakshmi',
  phone: '9025655627',
  location: 'Srirangam, Trichy',
  treatment: 'Orthodontics & Braces',
  date: '2024-12-25',
  time: '10:00 AM',
  note: '',
};

const msg = buildEnquiryMessage(base);
assert(msg.includes('Hello Marshalign Dental Care'), 'contains greeting');
assert(msg.includes("I'm Priya Lakshmi from Srirangam, Trichy"), 'name + location');
assert(msg.includes('Orthodontics & Braces'), 'treatment name');
assert(msg.includes('Wednesday, 25 Dec 2024'), 'formatted date');
assert(msg.includes('10:00 AM'), 'time');
assert(msg.includes('+91 90256 55627'), 'formatted phone');
assert(!msg.includes('Note:'), 'no note section when empty');

// With note
const msgWithNote = buildEnquiryMessage({ ...base, note: 'Please advise on Invisalign options.' });
assert(msgWithNote.includes('Note: Please advise on Invisalign options.'), 'note appears');

// Special characters in name / location
const special = buildEnquiryMessage({
  ...base,
  name: 'முரளி & Sons',
  location: 'T. Nagar / Trichy #2',
  note: 'Questions: 1) Cost? 2) Duration?',
});
assert(special.includes('முரளி & Sons'), 'Tamil name preserved');
assert(special.includes('T. Nagar / Trichy #2'), 'special chars in location');
assert(special.includes('Questions: 1) Cost? 2) Duration?'), 'special chars in note');

// Emoji in note
const emoji = buildEnquiryMessage({ ...base, note: '😊 Looking forward to it!' });
assert(emoji.includes('😊'), 'emoji in note preserved');

// Long note (exactly 200 chars)
const longNote = 'A'.repeat(200);
const longMsg = buildEnquiryMessage({ ...base, note: longNote });
assert(longMsg.includes(`Note: ${'A'.repeat(200)}`), '200-char note included');

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── buildEnquiryURL ────────────────────────────────────────────');

const url = buildEnquiryURL(base);
assert(url.startsWith('https://wa.me/919025655627?text='), 'URL starts with wa.me + number');
assert(url.length < 2000, `URL length (${url.length}) under 2000 chars`);
assert(!url.includes('\n'), 'no raw newlines in URL (encoded)');
assert(url.includes('%0A') || url.includes('%20'), 'spaces/newlines are encoded');

// URL with note + special chars
const urlSpecial = buildEnquiryURL({
  ...base,
  name: 'Test & Check',
  note: 'What about #implants & costs?',
});
assert(!urlSpecial.includes('#implants'), 'hash is URL-encoded');
assert(!urlSpecial.includes('&costs'), 'ampersand is URL-encoded');
assert(urlSpecial.length < 2000, 'URL with special chars still under 2000');

// URL with 200-char note
const urlLong = buildEnquiryURL({ ...base, note: 'B'.repeat(200) });
assert(urlLong.length < 2000, `URL with 200-char note (${urlLong.length}) under 2000`);

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── validateEnquiryForm ────────────────────────────────────────');

const validValues = {
  name: 'Priya',
  phone: '9025655627',
  location: 'Trichy',
  treatment: 'Orthodontics & Braces',
  date: '2099-12-31',
  time: '10:00 AM',
  note: '',
};

const noErrors = validateEnquiryForm(validValues);
assertEqual(Object.keys(noErrors).length, 0, 'valid form has no errors');

// Missing name
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, name: '' })).includes('name'), true, 'empty name flagged');

// Bad phone
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, phone: '123' })).includes('phone'), true, 'too-short phone flagged');
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, phone: '1234567890' })).includes('phone'), true, 'phone starting with 1 flagged');

// Missing treatment
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, treatment: '' })).includes('treatment'), true, 'empty treatment flagged');

// Past date
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, date: '2000-01-01' })).includes('date'), true, 'past date flagged');

// Note too long (201 chars)
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, note: 'Z'.repeat(201) })).includes('note'), true, 'note > 200 chars flagged');

// Note exactly 200 chars is valid
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, note: 'Z'.repeat(200) })).includes('note'), false, 'note = 200 chars is valid');

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\n❌  Some tests failed.');
  process.exit(1);
} else {
  console.log('\n✅  All tests passed.');
  process.exit(0);
}
