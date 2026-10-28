# CLIENT_CONFIRMATIONS.md
*Items that require confirmation or additional information from the doctors.*
*Do not publish unconfirmed data. Fields marked ACTION REQUIRED must be filled before going live.*

---

## 1. Sterilisation Step Captions — ACTION REQUIRED

The step captions and descriptions below appear on the new sterilisation section portrait cards and in the lightbox details panel.  
**Please verify that each caption and description accurately matches what is actually shown in the video.**  
If any caption or description is wrong, reply with the correct factual text (one plain sentence, present tense, no marketing language, max 18 words).

| Step | File | Card Title | Card Description (≤ 18 words) | Confirmed? |
|------|------|-----------|-------------------------------|------------|
| 01 | `sterilisation-001.mp4` | **Pouch Sealing** | "Dental instruments are placed into sterile pouches and sealed using a heat-sealing machine before autoclaving." | ☐ Pending |
| 02 | `sterilisation-002.mp4` | **Autoclave Loading** | "Sealed pouches are arranged and loaded into the autoclave chamber in preparation for the sterilisation cycle." | ☐ Pending |
| 03 | `sterilisation-003.mp4` | **Sterilisation Cycle** | "The autoclave runs a timed high-pressure steam cycle; the control panel displays cycle progress in real time." | ☐ Pending |
| 04 | `sterilisation-injection-disposal.mp4` | **Sharps Disposal** | "Used needles are immediately capped and deposited into a dedicated sharps container following each procedure." | ☐ Pending |

> **Policy reminders:**  
> - Do not use claims such as "100% sterile" or "infection-free" — only factual visible descriptions are acceptable.  
> - If a video does NOT clearly show what the caption says, provide a neutral description of what IS visible, or request removal of the step.  
> - To confirm: change "☐ Pending" to "✓ Confirmed — [date]".

---

## 2. Dr. Jose Olive A. — Missing Profile Information

The profile for Dr. Jose Olive A. currently shows only what is already on the site.
The following fields are **intentionally hidden** until confirmed. Each field will appear automatically once added to the data file — no developer needed for data-only fields.

| Field | Current Status | Value Needed |
|-------|---------------|-------------|
| Full qualification | Shown as "Prosthodontics & Implantology" | Confirm exact degree + university, e.g. "BDS, MDS (Prosthodontics & Implantology)" |
| College / University | Hidden — not shown | Please provide if the doctors approve |
| Year of passing / Experience | Hidden — not shown | Please provide if the doctors approve |
| Registration Number | Hidden — not shown | Please provide if required for professional display |
| Professional memberships | Hidden — not shown | Please provide if the doctors approve |
| Extended bio | Current bio is 3 neutral sentences | Doctors may provide a longer bio paragraph |
| Additional treatments | Currently shows: Dental Implants, Prosthodontics | Any others attributed to Dr. Jose Olive? |

> **Reminder:** No information will be published that has not been confirmed by the doctors.
> Invented or assumed data is not acceptable under site policy.

---

## 3. Clinic Photo Consent — Photos Held for Review

The following clinic photos are currently **not published** because they show staff members or patients.
They will only be published with explicit written consent from each person visible.

| File | Reason held | Status |
|------|------------|--------|
| `clinic/011-sterilisation-sealing.jpeg` | Shows staff member — consent needed | ☐ Pending |
| `clinic/012-sterilisation-area.jpeg` | Shows staff member — consent needed | ☐ Pending |
| `clinic/008-treatment-corridor.jpeg` | Shows staff in corridor — review needed | ☐ Pending |
| `clinic/010-clinical-suite-wide.jpeg` | Staff possibly visible — review needed | ☐ Pending |
| `clinic/007-clinical-suite-overview.jpeg` | Review needed | ☐ Pending |
| `clinic/009-operatory-consultation.jpeg` | Review needed | ☐ Pending |
| `clinic/003-waiting-lounge.jpeg` | Review needed — check for any patients visible | ☐ Pending |

To approve a photo: confirm consent, change `needs_review: true` to `false` in `gallery-originals/meta.json`, then re-run `npm run gallery`.
