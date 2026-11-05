/**
 * src/data/doctors.ts
 * Single source of truth for all doctor data.
 * Import from here in every component. Do NOT hardcode doctor data elsewhere.
 *
 * Fields:
 *   slug           — URL-safe identifier, used in /specialists/<slug>
 *   name           — Full legal name
 *   displayName    — Name shown in UI (may differ from full name)
 *   qualifications — Degrees string
 *   role           — Job title / role string
 *   tier           — 'primary' (large card) or 'consultant' (compact card)
 *   specialtyLine  — Short specialty descriptor for card label; leave '' to hide
 *   short_bio      — 2-3 sentence factual bio (no pronouns, no invented facts)
 *   long_bio       — Optional longer bio for profile page; leave '' to hide
 *   memberships    — Professional body memberships (shown as chips)
 *   registrationNo — MCI/DCI registration number; leave '' to hide
 *   photo          — Paths to generated WebP sizes (all in public/doctors/<slug>/)
 *   focal_x        — CSS object-position X (e.g. '50%')
 *   focal_y        — CSS object-position Y (e.g. '20%')
 *   order          — Sort order (ascending)
 *   visible        — Set false to hide from all UI without deleting
 *   enquiryName    — Name used in WhatsApp enquiry context
 *   alt            — Full alt text for the doctor photo
 */

export interface DoctorPhoto {
  w900: string;        // /doctors/<slug>/<slug>-900.webp
  w450: string;        // /doctors/<slug>/<slug>-450.webp
  avatar: string;      // /doctors/<slug>/<slug>-avatar.webp
  placeholder: string; // /doctors/<slug>/<slug>-placeholder.webp
}

export interface Doctor {
  slug: string;
  name: string;
  displayName: string;
  qualifications: string;
  role: string;
  tier: 'primary' | 'consultant';
  specialtyLine: string;
  short_bio: string;
  long_bio: string;
  memberships: string[];
  registrationNo: string;
  photo: DoctorPhoto;
  focal_x: string;
  focal_y: string;
  order: number;
  visible: boolean;
  enquiryName: string;
  alt: string;
}

export const DOCTORS: Doctor[] = [
  {
    slug:           'dr-marshal-antony',
    name:           'Dr. Marshal Antony M.',
    displayName:    'Dr. Marshal Antony M.',
    qualifications: 'BDS, MDS — Orthodontics & Dentofacial Orthopedics',
    role:           'Specialist in Orthodontics & Dentofacial Orthopedics',
    tier:           'primary',
    specialtyLine:  'Orthodontics & Dentofacial Orthopedics',
    short_bio:      'Dr. Marshal Antony M. is a specialist in Orthodontics and Dentofacial Orthopedics at Marshalign Dental Care, Trichy. Clinical focus includes diagnosing and correcting misaligned teeth and jaw relationships, with individualised treatment plans for patients of all ages.',
    long_bio:       '',
    memberships:    [],
    registrationNo: '',
    photo: {
      w900:        '/doctors/dr-marshal-antony/dr-marshal-antony-900.webp',
      w450:        '/doctors/dr-marshal-antony/dr-marshal-antony-450.webp',
      avatar:      '/doctors/dr-marshal-antony/dr-marshal-antony-avatar.webp',
      placeholder: '/doctors/dr-marshal-antony/dr-marshal-antony-placeholder.webp',
    },
    focal_x:     '50%',
    focal_y:     '20%',
    order:       1,
    visible:     true,
    enquiryName: 'Dr. Marshal',
    alt:         'Dr. Marshal Antony M., Orthodontist and Dentofacial Orthopedics specialist at Marshalign Dental Care',
  },
  {
    slug:           'dr-jose-olive',
    name:           'Dr. Jose Olive A.',
    displayName:    'Dr. Jose Olive A.',
    qualifications: 'Prosthodontics & Implantology',
    role:           'Specialist in Prosthodontics & Implantology',
    tier:           'primary',
    specialtyLine:  'Prosthodontics & Implantology',
    short_bio:      'Dr. Jose Olive A. is part of the clinical team at Marshalign Dental Care, Trichy, specialising in Prosthodontics and Implantology. Areas of clinical focus include prosthetic restorations and dental implants. To book a consultation, send an enquiry on WhatsApp.',
    long_bio:       '',
    memberships:    [],
    registrationNo: '',
    photo: {
      w900:        '/doctors/dr-jose-olive/dr-jose-olive-900.webp',
      w450:        '/doctors/dr-jose-olive/dr-jose-olive-450.webp',
      avatar:      '/doctors/dr-jose-olive/dr-jose-olive-avatar.webp',
      placeholder: '/doctors/dr-jose-olive/dr-jose-olive-placeholder.webp',
    },
    focal_x:     '50%',
    focal_y:     '20%',
    order:       2,
    visible:     true,
    enquiryName: 'Dr. Jose Olive',
    alt:         'Dr. Jose Olive A., Prosthodontist and Implantology specialist at Marshalign Dental Care',
  },
  {
    slug:           'dr-meenakshi',
    name:           'Dr. Meenakshi',
    displayName:    'Dr. Meenakshi',
    qualifications: 'BDS, MDS',
    role:           'Consultant Endodontist',
    tier:           'consultant',
    specialtyLine:  'Root Canal Specialist',
    short_bio:      'Dr. Meenakshi (BDS, MDS) is a Consultant Endodontist and root canal specialist at Marshalign Dental Care. Patients who need an expert opinion on root canal treatment can consult Dr. Meenakshi at the clinic.',
    long_bio:       '',
    memberships:    [],
    registrationNo: '',
    photo: {
      w900:        '/doctors/dr-meenakshi/dr-meenakshi-900.webp',
      w450:        '/doctors/dr-meenakshi/dr-meenakshi-450.webp',
      avatar:      '/doctors/dr-meenakshi/dr-meenakshi-avatar.webp',
      placeholder: '/doctors/dr-meenakshi/dr-meenakshi-placeholder.webp',
    },
    focal_x:     '50%',
    focal_y:     '15%',
    order:       3,
    visible:     true,
    enquiryName: 'Dr. Meenakshi',
    alt:         'Dr. Meenakshi, Consultant Endodontist at Marshalign Dental Care',
  },
  {
    slug:           'dr-j-sowmiya',
    name:           'Dr. J. Sowmiya',
    displayName:    'Dr. J. Sowmiya',
    qualifications: 'MDS',
    role:           'Consultant',
    tier:           'consultant',
    specialtyLine:  '',
    short_bio:      'Dr. J. Sowmiya (MDS) is a consultant at Marshalign Dental Care. Dr. Sowmiya is a member of the Global College of Oral Implantologists (GCOI) and the Indian Society of Periodontology (ISP).',
    long_bio:       '',
    memberships:    [
      'Global College of Oral Implantologists (GCOI)',
      'Indian Society of Periodontology (ISP)',
    ],
    registrationNo: '',
    photo: {
      w900:        '/doctors/dr-j-sowmiya/dr-j-sowmiya-900.webp',
      w450:        '/doctors/dr-j-sowmiya/dr-j-sowmiya-450.webp',
      avatar:      '/doctors/dr-j-sowmiya/dr-j-sowmiya-avatar.webp',
      placeholder: '/doctors/dr-j-sowmiya/dr-j-sowmiya-placeholder.webp',
    },
    focal_x:     '50%',
    focal_y:     '15%',
    order:       4,
    visible:     true,
    enquiryName: 'Dr. Sowmiya',
    alt:         'Dr. J. Sowmiya, Consultant at Marshalign Dental Care',
  },
];

export const PRIMARY_DOCTORS    = DOCTORS.filter(d => d.tier === 'primary'    && d.visible);
export const CONSULTANT_DOCTORS = DOCTORS.filter(d => d.tier === 'consultant' && d.visible);
