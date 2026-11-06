/**
 * src/data/doctors.ts
 * Single source of truth for all doctor data.
 * Import from here in every component. Do NOT hardcode doctor data elsewhere.
 *
 * Fields:
 *   slug           — URL-safe identifier, used for #<slug> anchors on /specialists
 *   name           — Full legal name
 *   displayName    — Name shown in UI
 *   qualifications — Degrees string
 *   role           — Job title / role string
 *   specialtyLine  — Short specialty descriptor shown as chip; '' to hide
 *   short_bio      — 2-3 sentence intro bio (no pronouns, no invented facts)
 *   paragraphs     — Array of body paragraphs for the detail section
 *   reasonsToConsult — { heading: string; items: string[] } | null — null to hide
 *   memberships    — Professional body memberships (shown as chips)
 *   registrationNo — MCI/DCI registration number; '' to hide
 *   extraSections  — Array of { title: string; content: string } for expandable "More about" section
 *   whatsappText   — Prefill text for direct wa.me link (never mentions confirmed/booked)
 *   photo          — Paths to generated WebP sizes (all in public/doctors/<slug>/)
 *   focal_x        — CSS object-position X (e.g. '50%')
 *   focal_y        — CSS object-position Y (e.g. '20%')
 *   order          — Sort order (ascending)
 *   visible        — Set false to hide from all UI without deleting
 *   alt            — Full alt text for the doctor photo
 */

export interface DoctorPhoto {
  w900: string; // /doctors/<slug>/<slug>-900.webp
  w450: string; // /doctors/<slug>/<slug>-450.webp
  avatar: string; // /doctors/<slug>/<slug>-avatar.webp
  placeholder: string; // /doctors/<slug>/<slug>-placeholder.webp
}

export interface DoctorReasonsToConsult {
  heading: string;
  items: string[];
}

export interface DoctorExtraSection {
  title: string;
  content: string;
}

export interface Doctor {
  slug: string;
  name: string;
  displayName: string;
  qualifications: string;
  role: string;
  specialtyLine: string;
  short_bio: string;
  paragraphs: string[];
  reasonsToConsult: DoctorReasonsToConsult | null;
  memberships: string[];
  registrationNo: string;
  extraSections: DoctorExtraSection[];
  whatsappText: string;
  photo: DoctorPhoto;
  focal_x: string;
  focal_y: string;
  order: number;
  visible: boolean;
  alt: string;
}

export const DOCTORS: Doctor[] = [
  {
    slug: 'dr-marshal-antony',
    name: 'Dr. Marshal Antony M.',
    displayName: 'Dr. Marshal Antony M.',
    qualifications: 'BDS, MDS — Orthodontics & Dentofacial Orthopedics',
    role: 'Specialist in Orthodontics & Dentofacial Orthopedics',
    specialtyLine: 'Orthodontics & Dentofacial Orthopedics',
    short_bio:
      'Crooked teeth, a jaw that does not sit right, or a child whose bite is developing unevenly — these are the kinds of concerns that bring patients to an orthodontist. Dr. Marshal Antony M. (BDS, MDS) is the founder and lead specialist at Marshalign Dental Care, with a clinical focus on Orthodontics and Dentofacial Orthopedics.',
    paragraphs: [
      'Orthodontics is the branch of dentistry concerned with the alignment of teeth and the relationship between the upper and lower jaws. Dentofacial orthopedics goes a step further, addressing the growth and position of the facial bones — work that is most effective when started at the right age.',
      'At Marshalign Dental Care, every patient begins with a thorough clinical assessment. Treatment plans are explained in full before anything is started, so patients and families understand what to expect at each stage.',
      'Common treatment options include fixed braces, clear aligners, retainers, and functional appliances for growing patients. The choice depends on the clinical findings, not a one-size approach.',
    ],
    reasonsToConsult: null,
    memberships: [],
    registrationNo: '',
    extraSections: [],
    whatsappText:
      'Hello Marshalign Dental Care, I would like to book an appointment with Dr. Marshal Antony M. (Specialist in Orthodontics & Dentofacial Orthopedics). Please share the available timing.',
    photo: {
      w900: '/doctors/dr-marshal-antony/dr-marshal-antony-900.webp',
      w450: '/doctors/dr-marshal-antony/dr-marshal-antony-450.webp',
      avatar: '/doctors/dr-marshal-antony/dr-marshal-antony-avatar.webp',
      placeholder: '/doctors/dr-marshal-antony/dr-marshal-antony-placeholder.webp',
    },
    focal_x: '50%',
    focal_y: '15%',
    order: 1,
    visible: true,
    alt: 'Dr. Marshal Antony M., Orthodontist and Dentofacial Orthopedics specialist at Marshalign Dental Care',
  },
  {
    slug: 'dr-jose-olive',
    name: 'Dr. Jose Olive A.',
    displayName: 'Dr. Jose Olive A.',
    qualifications: 'Prosthodontics & Implantology',
    role: 'Specialist in Prosthodontics & Implantology',
    specialtyLine: 'Prosthodontics & Implantology',
    short_bio:
      'A missing tooth, a worn-down crown, or a full set of dentures that no longer fits — prosthodontics covers a wide range of restorative and replacement work. Dr. Jose Olive A. is a Specialist in Prosthodontics and Implantology at Marshalign Dental Care.',
    paragraphs: [
      'Prosthodontics is the dental specialty focused on restoring and replacing teeth — using crowns, bridges, veneers, dentures, and dental implants. The goal is both functional and aesthetic: teeth that work well and look natural.',
      'Dental implants are artificial tooth roots, usually made of titanium, that are placed into the jawbone to support a replacement tooth. They are considered the closest modern dentistry can get to a natural tooth in terms of feel and longevity.',
      'Appointments with Dr. Jose Olive A. start with an assessment of what is missing or damaged, the health of the surrounding gums and bone, and a discussion of which restoration option suits the patient best.',
    ],
    reasonsToConsult: null,
    memberships: [],
    registrationNo: '',
    extraSections: [],
    whatsappText:
      'Hello Marshalign Dental Care, I would like to book an appointment with Dr. Jose Olive A. (Specialist in Prosthodontics & Implantology). Please share the available timing.',
    photo: {
      w900: '/doctors/dr-jose-olive/dr-jose-olive-900.webp',
      w450: '/doctors/dr-jose-olive/dr-jose-olive-450.webp',
      avatar: '/doctors/dr-jose-olive/dr-jose-olive-avatar.webp',
      placeholder: '/doctors/dr-jose-olive/dr-jose-olive-placeholder.webp',
    },
    focal_x: '50%',
    focal_y: '15%',
    order: 2,
    visible: true,
    alt: 'Dr. Jose Olive A., Prosthodontist and Implantology specialist at Marshalign Dental Care',
  },
  {
    slug: 'dr-j-sowmiya',
    name: 'Dr. J. Sowmiya',
    displayName: 'Dr. J. Sowmiya',
    qualifications: 'MDS',
    role: 'Dental Specialist',
    specialtyLine: 'Periodontics & Oral Implantology',
    short_bio:
      'Dr. J. Sowmiya (MDS) is a dental specialist at Marshalign Dental Care and a member of the Global College of Oral Implantologists (GCOI) and the Indian Society of Periodontology (ISP), two professional bodies focused on dental implants and gum health.',
    paragraphs: [
      'Oral implantology deals with replacing missing teeth with artificial tooth roots, and periodontology with the health of the gums and the bone that supports the teeth.',
    ],
    reasonsToConsult: null,
    memberships: [
      'Global College of Oral Implantologists (GCOI)',
      'Indian Society of Periodontology (ISP)',
    ],
    registrationNo: '',
    extraSections: [],
    whatsappText:
      'Hello Marshalign Dental Care, I would like to book an appointment with Dr. J. Sowmiya. Please share the available timing.',
    photo: {
      w900: '/doctors/dr-j-sowmiya/dr-j-sowmiya-900.webp',
      w450: '/doctors/dr-j-sowmiya/dr-j-sowmiya-450.webp',
      avatar: '/doctors/dr-j-sowmiya/dr-j-sowmiya-avatar.webp',
      placeholder: '/doctors/dr-j-sowmiya/dr-j-sowmiya-placeholder.webp',
    },
    focal_x: '50%',
    focal_y: '15%',
    order: 3,
    visible: true,
    alt: 'Dr. J. Sowmiya, Dental Specialist at Marshalign Dental Care',
  },
  {
    slug: 'dr-meenakshi',
    name: 'Dr. Meenakshi',
    displayName: 'Dr. Meenakshi',
    qualifications: 'BDS, MDS',
    role: 'Specialist Endodontist',
    specialtyLine: 'Root Canal Specialist',
    short_bio:
      'A toothache that wakes you at night, a tooth that stays sensitive to hot and cold, or a dentist telling you the nerve is affected: this is where an endodontist helps. Dr. Meenakshi (BDS, MDS) is our Specialist Endodontist and root canal specialist.',
    paragraphs: [
      'Endodontics is the branch of dentistry that deals with the inside of the tooth — the pulp and the nerves — and root canal treatment is its best-known procedure.',
      'Assessments with Dr. Meenakshi cover what is causing the pain or sensitivity, whether a root canal is needed, and what the treatment involves.',
    ],
    reasonsToConsult: null,
    memberships: [],
    registrationNo: '',
    extraSections: [],
    whatsappText:
      'Hello Marshalign Dental Care, I would like to book an appointment with Dr. Meenakshi (Specialist Endodontist). Please share the available timing.',
    photo: {
      w900: '/doctors/dr-meenakshi/dr-meenakshi-900.webp',
      w450: '/doctors/dr-meenakshi/dr-meenakshi-450.webp',
      avatar: '/doctors/dr-meenakshi/dr-meenakshi-avatar.webp',
      placeholder: '/doctors/dr-meenakshi/dr-meenakshi-placeholder.webp',
    },
    focal_x: '50%',
    focal_y: '15%',
    order: 4,
    visible: true,
    alt: 'Dr. Meenakshi, Specialist Endodontist at Marshalign Dental Care',
  },
];

export const VISIBLE_DOCTORS = DOCTORS.filter(d => d.visible).sort((a, b) => a.order - b.order);
