// src/config.ts
var WA_NUMBER = "919025655627";
var WA_MESSAGE = encodeURIComponent(
  "Hello Marshalign Dental Care, I found your website and would like to enquire about your dental treatments. Could you please share more information?"
);
var WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;
var CLINIC_WHATSAPP = "919025655627";

// src/lib/enquiry.ts
function normaliseIndianPhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  if (digits.length === 10) {
    return digits;
  }
  return null;
}
function isValidIndianMobile(tenDigits) {
  return /^[6-9]\d{9}$/.test(tenDigits);
}
var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const weekday = WEEKDAYS[dt.getUTCDay()];
  const day = String(dt.getUTCDate()).padStart(2, "0");
  const month = MONTHS[dt.getUTCMonth()];
  const year = dt.getUTCFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}
function todayISO() {
  const d = /* @__PURE__ */ new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function buildEnquiryMessage(values) {
  const normalized = normaliseIndianPhone(values.phone) ?? values.phone.trim();
  const displayPhone = `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
  const formattedDate = formatDate(values.date);
  const lines = [
    `Hello Marshalign Dental Care,`,
    `I'm ${values.name.trim()} from ${values.location.trim()}.`,
    `I'd like to book an appointment for ${values.treatment} on ${formattedDate} at ${values.time}. Is this slot available?`,
    `My phone number: ${displayPhone}`
  ];
  if (values.note.trim()) {
    lines.push(`Note: ${values.note.trim()}`);
  }
  return lines.join("\n");
}
function buildEnquiryURL(values) {
  const message = buildEnquiryMessage(values);
  return `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
function validateEnquiryForm(values) {
  const errors = {};
  if (!values.name.trim()) {
    errors.name = "Please enter your full name.";
  }
  const phone10 = normaliseIndianPhone(values.phone);
  if (!phone10) {
    errors.phone = "Please enter a valid 10-digit Indian mobile number.";
  } else if (!isValidIndianMobile(phone10)) {
    errors.phone = "Mobile number must start with 6, 7, 8, or 9.";
  }
  if (!values.location.trim()) {
    errors.location = "Please enter your area or locality.";
  }
  if (!values.treatment) {
    errors.treatment = "Please select a treatment.";
  }
  if (!values.date) {
    errors.date = "Please select a preferred date.";
  } else if (values.date < todayISO()) {
    errors.date = "Date cannot be in the past.";
  }
  if (!values.time) {
    errors.time = "Please select a preferred time.";
  }
  if (values.note.length > 200) {
    errors.note = `Note must be 200 characters or fewer (currently ${values.note.length}).`;
  }
  return errors;
}

// src/lib/enquiry.test.ts
var passed = 0;
var failed = 0;
function assert(condition, message) {
  if (condition) {
    console.log(`  \u2713  ${message}`);
    passed++;
  } else {
    console.error(`  \u2717  FAIL: ${message}`);
    failed++;
  }
}
function assertEqual(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(`  \u2713  ${label}`);
    passed++;
  } else {
    console.error(`  \u2717  FAIL: ${label}`);
    console.error(`       expected: ${JSON.stringify(expected)}`);
    console.error(`       actual  : ${JSON.stringify(actual)}`);
    failed++;
  }
}
console.log("\n\u2500\u2500 normaliseIndianPhone \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
assertEqual(normaliseIndianPhone("+91 90256 55627"), "9025655627", "+91 with spaces");
assertEqual(normaliseIndianPhone("919025655627"), "9025655627", "12-digit with 91 prefix");
assertEqual(normaliseIndianPhone("09025655627"), "9025655627", "11-digit with 0 prefix");
assertEqual(normaliseIndianPhone("9025655627"), "9025655627", "10-digit clean");
assertEqual(normaliseIndianPhone("90256-55627"), "9025655627", "10-digit with dash");
assertEqual(normaliseIndianPhone("90256 55627"), "9025655627", "10-digit with space");
assertEqual(normaliseIndianPhone("+919025655627"), "9025655627", "+91 no space");
assertEqual(normaliseIndianPhone("123"), null, "too short \u2192 null");
assertEqual(normaliseIndianPhone("12345678901234"), null, "too long \u2192 null");
console.log("\n\u2500\u2500 isValidIndianMobile \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
assert(isValidIndianMobile("9025655627"), "valid 9xxx");
assert(isValidIndianMobile("8025655627"), "valid 8xxx");
assert(isValidIndianMobile("7025655627"), "valid 7xxx");
assert(isValidIndianMobile("6025655627"), "valid 6xxx");
assert(!isValidIndianMobile("1234567890"), "rejects 1xxx");
assert(!isValidIndianMobile("5234567890"), "rejects 5xxx");
assert(!isValidIndianMobile("902565562"), "rejects 9-digit");
console.log("\n\u2500\u2500 formatDate \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
assertEqual(formatDate("2024-12-25"), "Wednesday, 25 Dec 2024", "Christmas 2024");
assertEqual(formatDate("2025-01-01"), "Wednesday, 01 Jan 2025", "New Year 2025");
assertEqual(formatDate("2024-02-29"), "Thursday, 29 Feb 2024", "Leap day 2024");
assertEqual(formatDate("2026-10-19"), "Monday, 19 Oct 2026", "Oct 2026");
console.log("\n\u2500\u2500 buildEnquiryMessage \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
var base = {
  name: "Priya Lakshmi",
  phone: "9025655627",
  location: "Srirangam, Trichy",
  treatment: "Orthodontics & Braces",
  date: "2024-12-25",
  time: "10:00 AM",
  note: ""
};
var msg = buildEnquiryMessage(base);
assert(msg.includes("Hello Marshalign Dental Care"), "contains greeting");
assert(msg.includes("I'm Priya Lakshmi from Srirangam, Trichy"), "name + location");
assert(msg.includes("Orthodontics & Braces"), "treatment name");
assert(msg.includes("Wednesday, 25 Dec 2024"), "formatted date");
assert(msg.includes("10:00 AM"), "time");
assert(msg.includes("+91 90256 55627"), "formatted phone");
assert(!msg.includes("Note:"), "no note section when empty");
var msgWithNote = buildEnquiryMessage({ ...base, note: "Please advise on Invisalign options." });
assert(msgWithNote.includes("Note: Please advise on Invisalign options."), "note appears");
var special = buildEnquiryMessage({
  ...base,
  name: "\u0BAE\u0BC1\u0BB0\u0BB3\u0BBF & Sons",
  location: "T. Nagar / Trichy #2",
  note: "Questions: 1) Cost? 2) Duration?"
});
assert(special.includes("\u0BAE\u0BC1\u0BB0\u0BB3\u0BBF & Sons"), "Tamil name preserved");
assert(special.includes("T. Nagar / Trichy #2"), "special chars in location");
assert(special.includes("Questions: 1) Cost? 2) Duration?"), "special chars in note");
var emoji = buildEnquiryMessage({ ...base, note: "\u{1F60A} Looking forward to it!" });
assert(emoji.includes("\u{1F60A}"), "emoji in note preserved");
var longNote = "A".repeat(200);
var longMsg = buildEnquiryMessage({ ...base, note: longNote });
assert(longMsg.includes(`Note: ${"A".repeat(200)}`), "200-char note included");
console.log("\n\u2500\u2500 buildEnquiryURL \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
var url = buildEnquiryURL(base);
assert(url.startsWith("https://wa.me/919025655627?text="), "URL starts with wa.me + number");
assert(url.length < 2e3, `URL length (${url.length}) under 2000 chars`);
assert(!url.includes("\n"), "no raw newlines in URL (encoded)");
assert(url.includes("%0A") || url.includes("%20"), "spaces/newlines are encoded");
var urlSpecial = buildEnquiryURL({
  ...base,
  name: "Test & Check",
  note: "What about #implants & costs?"
});
assert(!urlSpecial.includes("#implants"), "hash is URL-encoded");
assert(!urlSpecial.includes("&costs"), "ampersand is URL-encoded");
assert(urlSpecial.length < 2e3, "URL with special chars still under 2000");
var urlLong = buildEnquiryURL({ ...base, note: "B".repeat(200) });
assert(urlLong.length < 2e3, `URL with 200-char note (${urlLong.length}) under 2000`);
console.log("\n\u2500\u2500 validateEnquiryForm \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
var validValues = {
  name: "Priya",
  phone: "9025655627",
  location: "Trichy",
  treatment: "Orthodontics & Braces",
  date: "2099-12-31",
  time: "10:00 AM",
  note: ""
};
var noErrors = validateEnquiryForm(validValues);
assertEqual(Object.keys(noErrors).length, 0, "valid form has no errors");
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, name: "" })).includes("name"), true, "empty name flagged");
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, phone: "123" })).includes("phone"), true, "too-short phone flagged");
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, phone: "1234567890" })).includes("phone"), true, "phone starting with 1 flagged");
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, treatment: "" })).includes("treatment"), true, "empty treatment flagged");
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, date: "2000-01-01" })).includes("date"), true, "past date flagged");
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, note: "Z".repeat(201) })).includes("note"), true, "note > 200 chars flagged");
assertEqual(Object.keys(validateEnquiryForm({ ...validValues, note: "Z".repeat(200) })).includes("note"), false, "note = 200 chars is valid");
console.log(`
${"\u2500".repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("\n\u274C  Some tests failed.");
  process.exit(1);
} else {
  console.log("\n\u2705  All tests passed.");
  process.exit(0);
}
