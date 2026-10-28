/**
 * Treatment data for all clinic treatments.
 * Single source of truth for treatment cards, detail pages, footer links, and sitemaps.
 */

export interface TreatmentPageData {
  id: string;
  slug: string;
  aliases?: string[];
  name: string;
  specialty: string;
  doctorName: string;
  attribution: string;
  icon: string;
  image: string;
  alt: string;
  shortDescription: string;
  pageTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  overview: string;
  benefits?: string[];
  procedure: string[];
  whoIsItFor: string;
  faq: { question: string; answer: string }[];
}

export const TREATMENTS: TreatmentPageData[] = [
  {
    id: 'orthodontics',
    slug: 'orthodontics',
    aliases: ['orthodontics-braces'],
    name: 'Orthodontics & Braces',
    specialty: 'Orthodontics & Dentofacial Orthopedics',
    doctorName: 'Dr. Marshal Antony M.',
    attribution: 'Dr. Marshal Antony M.',
    icon: '⟳',
    image: '/orthodontics-treatment.webp',
    alt: 'Orthodontist examining and adjusting braces on patient in dental clinic',
    shortDescription:
      'Straighten misaligned teeth and achieve a balanced bite with evidence-based orthodontic treatment. Braces and modern orthodontic appliances tailored to your smile goals.',
    pageTitle: 'Orthodontics & Braces Treatment in Trichy | Marshalign Dental Care',
    metaDescription:
      'Expert orthodontic treatment and braces by Dr. Marshal Antony M., MDS Orthodontics, at Marshalign Dental Care, Trichy. Personalised treatment plans for all ages.',
    heroSubtitle: 'Specialist orthodontic care by Dr. Marshal Antony M.',
    overview:
      'Orthodontics is the dental specialty focused on diagnosing, preventing, and treating misaligned teeth and jaws. At Marshalign Dental Care, orthodontic treatment is planned and delivered by Dr. Marshal Antony M., a specialist with an MDS in Orthodontics & Dentofacial Orthopedics. Treatment options include traditional metal braces, ceramic braces, and modern self-ligating bracket systems, each selected based on the clinical complexity of the case and the patient\'s individual goals.',
    benefits: [
      'Corrects crowded, spaced, or misaligned teeth for improved function and aesthetics',
      'Addresses bite problems including overbite, underbite, crossbite, and open bite',
      'Personalised treatment plans developed after thorough clinical and diagnostic assessment',
      'Treatment delivered by a specialist orthodontist with dedicated MDS training',
      'Improves long-term oral health by enabling easier cleaning and reducing uneven wear',
    ],
    procedure: [
      'Initial consultation with clinical examination and diagnostic imaging (X-rays, photographs)',
      'Treatment planning — the specialist explains the diagnosis, treatment options, and expected timeline',
      'Fitting of orthodontic appliances (braces or other devices) as per the agreed plan',
      'Regular follow-up visits for adjustments and progress monitoring',
      'Completion and retention phase with retainers to maintain the corrected alignment',
    ],
    whoIsItFor:
      'Orthodontic treatment is suitable for children, teenagers, and adults with misaligned teeth, spacing issues, or bite irregularities. An initial consultation will determine whether braces or alternative orthodontic appliances are appropriate for your specific condition.',
    faq: [
      {
        question: 'How long does orthodontic treatment typically take?',
        answer: 'Treatment duration depends on the complexity of the case, but most orthodontic treatments at Marshalign range from 12 to 24 months. Your specialist will provide a personalised estimate after the diagnostic assessment.',
      },
      {
        question: 'Is orthodontic treatment painful?',
        answer: 'Patients may experience mild discomfort for a few days after braces are fitted or adjusted, but this is generally manageable and subsides quickly. Modern orthodontic appliances are designed for improved patient comfort.',
      },
    ],
  },
  {
    id: 'dentofacial',
    slug: 'dentofacial-orthopedics',
    aliases: ['dentofacial'],
    name: 'Dentofacial Orthopedics',
    specialty: 'Orthodontics & Dentofacial Orthopedics',
    doctorName: 'Dr. Marshal Antony M.',
    attribution: 'Dr. Marshal Antony M.',
    icon: '◈',
    image: '/dentofacial-orthopedics.webp',
    alt: 'Dentofacial orthopedics consultation and facial growth guidance',
    shortDescription:
      'Specialist guidance of facial growth and development in younger patients. Corrective appliances and interceptive treatment for lasting facial balance.',
    pageTitle: 'Dentofacial Orthopedics in Trichy | Marshalign Dental Care',
    metaDescription:
      'Dentofacial orthopedics for children and growing patients by Dr. Marshal Antony M. at Marshalign Dental Care, Trichy. Interceptive jaw growth guidance.',
    heroSubtitle: 'Specialist care by Dr. Marshal Antony M.',
    overview:
      'Dentofacial orthopedics guides the growth of the jaws in growing children and teenagers to correct differences in jaw size or position, often together with braces. It is assessed and planned by an orthodontist.',
    benefits: [
      'Guidance of jaw growth during active developmental years',
      'Helps correct skeletal imbalances between upper and lower jaws',
      'Can reduce the complexity of subsequent orthodontic treatment',
      'Uses tailored functional appliances or expanders based on individual assessment',
    ],
    procedure: [
      'Assessment with records (photos, X-rays, scans or impressions)',
      'Diagnosis and plan explained',
      'Appliance fitting (for example a functional appliance or expander, as advised)',
      'Regular review visits',
      'Braces if needed afterwards',
      'Retention',
    ],
    whoIsItFor:
      'children with a protruding upper jaw or underbite, crossbite, a narrow upper jaw, or crowding linked to jaw size; an orthodontic check-up from around age 7 is often suggested.',
    faq: [
      {
        question: 'What age is best?',
        answer: 'Timing depends on growth, so an early assessment helps.',
      },
      {
        question: 'Is it only for children?',
        answer: 'Jaw growth is mostly complete in adults, so planning differs; the orthodontist will advise options.',
      },
      {
        question: 'Will braces still be needed?',
        answer: 'Often, but not always.',
      },
    ],
  },
  {
    id: 'implants',
    slug: 'dental-implants',
    aliases: ['implants'],
    name: 'Dental Implants',
    specialty: 'Prosthodontics & Implantology',
    doctorName: 'Dr. Jose Olive A.',
    attribution: 'Dr. Jose Olive A.',
    icon: '⬡',
    image: '/dental-implant-treatment.webp',
    alt: 'Precision dental implant restoration planning in modern operatory',
    shortDescription:
      'Replace missing teeth permanently with precision-placed dental implants. A long-term solution that looks, feels, and functions like your natural teeth.',
    pageTitle: 'Dental Implants in Trichy | Marshalign Dental Care',
    metaDescription:
      'Dental implant treatment at Marshalign Dental Care, Trichy. Permanent, natural-looking tooth replacement solutions by our specialist team.',
    heroSubtitle: 'Specialist care at Marshalign Dental Care',
    overview:
      'A dental implant replaces the root of a missing tooth with a small titanium post placed in the jawbone, topped with a crown, so the replacement tooth is fixed in place and works like a natural tooth. Whether it suits you depends on your bone, gum health and general health, and is decided after an examination.',
    benefits: [
      'Replaces missing tooth root with a biocompatible titanium post',
      'Fixed restoration topped with a natural-looking crown',
      'Preserves jawbone structure and adjacent natural teeth',
      'Functions and feels like a natural tooth',
    ],
    procedure: [
      'Consultation and examination with X-rays/scan',
      'Treatment planning',
      'Implant placement under local anaesthesia',
      'Healing while the bone integrates with the implant (varies per person)',
      'Crown or bridge fitting',
      'Regular check-ups and care',
    ],
    whoIsItFor:
      'one or more missing teeth; loose dentures; healthy gums and enough jawbone (or bone support planned first); patients who can maintain good oral hygiene.',
    faq: [
      {
        question: 'Is it painful?',
        answer: 'It is done under local anaesthesia; mild soreness afterwards is common and your dentist will advise.',
      },
      {
        question: 'Am I suitable?',
        answer: 'Only an examination can tell.',
      },
      {
        question: 'How long do implants last?',
        answer: 'With good hygiene, healthy gums and regular check-ups many last for years; smoking and poor hygiene can reduce success.',
      },
    ],
  },
  {
    id: 'prosthodontics',
    slug: 'prosthodontics',
    aliases: [],
    name: 'Prosthodontics',
    specialty: 'Prosthodontics & Implantology',
    doctorName: 'Dr. Jose Olive A.',
    attribution: 'Dr. Jose Olive A.',
    icon: '◇',
    image: '/prosthodontics-treatment.webp',
    alt: 'Prosthodontist assessing custom ceramic dental restoration and crown',
    shortDescription:
      'Restore the function and aesthetics of your smile with expertly crafted crowns, bridges, dentures, and full-mouth rehabilitation by a specialist prosthodontist.',
    pageTitle: 'Prosthodontics & Smile Restoration in Trichy | Marshalign Dental Care',
    metaDescription:
      'Prosthodontic treatment including crowns, bridges, dentures, and full-mouth rehabilitation at Marshalign Dental Care, Trichy.',
    heroSubtitle: 'Specialist prosthetic rehabilitation at Marshalign Dental Care',
    overview:
      'Prosthodontics is the dental specialty dedicated to restoring and replacing teeth through crowns, bridges, dentures, and comprehensive full-mouth rehabilitation. At Marshalign Dental Care, prosthodontic treatment combines specialist clinical training with modern restorative materials to provide durable, natural-looking results that restore both function and confidence.',
    benefits: [
      'Restores chewing function, speech clarity, and facial aesthetics after tooth loss',
      'Custom-fabricated crowns, bridges, and dentures for a natural, comfortable fit',
      'Full-mouth rehabilitation for patients with extensive dental damage or wear',
      'Uses advanced ceramic and zirconia materials for durability and lifelike appearance',
      'Planned and delivered by a dedicated prosthodontic specialist',
    ],
    procedure: [
      'Comprehensive oral evaluation including assessment of remaining teeth, gums, and jaw',
      'Treatment planning — explaining available restorative options and expected outcomes',
      'Tooth preparation and precision impressions for custom prosthetic fabrication',
      'Trial fitting to verify comfort, bite alignment, and aesthetics',
      'Final placement and cementation of the restoration with follow-up review',
    ],
    whoIsItFor:
      'Prosthodontic treatment is appropriate for patients who need to replace or restore damaged, worn, or missing teeth. This includes single tooth crowns, multi-tooth bridges, partial or complete dentures, and full-mouth rehabilitation cases.',
    faq: [
      {
        question: 'What is the difference between a crown and a bridge?',
        answer: 'A crown covers and protects a single damaged tooth, while a bridge replaces one or more missing teeth by anchoring an artificial tooth to the adjacent natural teeth. Both are custom-made for a precise fit.',
      },
      {
        question: 'How long do dental crowns and bridges last?',
        answer: 'With good oral hygiene and regular dental visits, well-made crowns and bridges can last 10–15 years or longer. The specialist will advise on care to maximise the lifespan of your restoration.',
      },
    ],
  },
  {
    id: 'examination',
    slug: 'general-examination',
    aliases: ['examination'],
    name: 'General Dental Examination',
    specialty: 'Comprehensive Diagnostics',
    doctorName: 'Marshalign Dental Care',
    attribution: 'Marshalign Dental Care',
    icon: '◎',
    image: '/dental-examination.webp',
    alt: 'Dentist conducting comprehensive oral examination with mouth mirror',
    shortDescription:
      'Detailed clinical assessment of oral health, periodontal screening, and digital diagnostics to detect dental concerns early and maintain long-term smile wellness.',
    pageTitle: 'General Dental Examination in Trichy | Marshalign Dental Care',
    metaDescription:
      'Comprehensive dental check-up and examination at Marshalign Dental Care, Trichy. Thorough assessment, periodontal screening, and personalised care recommendations.',
    heroSubtitle: 'Care provided by Marshalign Dental Care',
    overview:
      'A thorough check of your teeth, gums, bite and the soft tissues of the mouth to find problems early and plan any care, with advice to keep your mouth healthy.',
    benefits: [
      'Early detection of decay, gum issues, and oral health concerns',
      'Full examination of teeth, gums, bite, and soft oral tissues',
      'Targeted imaging only when clinically indicated',
      'Clear findings and preventive advice tailored to your needs',
    ],
    procedure: [
      'Medical and dental history',
      'Examination of teeth, gums and bite',
      'Check of the tongue, cheeks and soft tissues',
      'X-rays only if needed',
      'Findings explained and a clear plan',
    ],
    whoIsItFor:
      'everyone, including first-time visitors; anyone with pain, bleeding gums, sensitivity or bad breath; before starting braces or other treatment; regular check-ups, commonly around every six months or as advised.',
    faq: [
      {
        question: 'How often should I come?',
        answer: 'Often every six months, but your dentist may advise differently.',
      },
      {
        question: 'Are X-rays always needed?',
        answer: 'No, only when they help diagnosis.',
      },
      {
        question: 'Will I need treatment?',
        answer: 'Not always; the exam shows what is needed.',
      },
    ],
  },
  {
    id: 'cleaning',
    slug: 'teeth-cleaning',
    aliases: ['cleaning'],
    name: 'Professional Teeth Cleaning',
    specialty: 'Preventive Oral Care',
    doctorName: 'Marshalign Dental Care',
    attribution: 'Marshalign Dental Care',
    icon: '✦',
    image: '/teeth-cleaning.webp',
    alt: 'Dental professional performing ultrasonic scaling and teeth cleaning',
    shortDescription:
      'Gentle ultrasonic scaling and dental prophylaxis to remove plaque, tartar, and surface stains, protecting gums and refreshing oral freshness.',
    pageTitle: 'Professional Teeth Cleaning & Scaling in Trichy | Marshalign Dental Care',
    metaDescription:
      'Professional teeth cleaning and ultrasonic scaling at Marshalign Dental Care, Trichy. Remove plaque, tartar, and stains for healthier gums and fresher breath.',
    heroSubtitle: 'Care provided by Marshalign Dental Care',
    overview:
      'Scaling and polishing removes plaque, tartar and surface stains that brushing cannot, helping keep gums healthy and breath fresher.',
    benefits: [
      'Removes stubborn calculus and bacterial plaque deposits',
      'Helps prevent and manage gum inflammation and bleeding',
      'Polishes tooth surfaces and removes external stains',
      'Personalised home oral hygiene recommendations',
    ],
    procedure: [
      'Quick check of teeth and gums',
      'Scaling to remove tartar',
      'Polishing',
      'Home-care advice and a recall interval',
    ],
    whoIsItFor:
      'bleeding or puffy gums, visible tartar, bad breath, surface stains, before braces, and as regular maintenance as advised.',
    faq: [
      {
        question: 'Does it damage enamel?',
        answer: 'When done properly, no; some temporary sensitivity can occur.',
      },
      {
        question: 'Does it whiten teeth?',
        answer: 'It removes surface stains but does not change natural tooth shade.',
      },
      {
        question: 'Why do gaps look bigger afterwards?',
        answer: 'Removing tartar reveals spaces that were already there.',
      },
    ],
  },
  {
    id: 'restorative',
    slug: 'restorative-dentistry',
    aliases: ['restorative'],
    name: 'Restorative Dentistry',
    specialty: 'Conservative Dental Care',
    doctorName: 'Marshalign Dental Care',
    attribution: 'Marshalign Dental Care',
    icon: '❋',
    image: '/restorative-dentistry.webp',
    alt: 'Dentist placing and light-curing tooth-colored composite restoration',
    shortDescription:
      'Tooth-colored composite fillings and conservative restorations that blend seamlessly with natural enamel while restoring strength and chewing function.',
    pageTitle: 'Restorative Dentistry & Fillings in Trichy | Marshalign Dental Care',
    metaDescription:
      'Tooth-colored composite fillings and restorative dentistry at Marshalign Dental Care, Trichy. Conservative restorations that match your natural enamel.',
    heroSubtitle: 'Care provided by Marshalign Dental Care',
    overview:
      'Restorative dentistry repairs teeth that are decayed, cracked, chipped or worn, and replaces missing tooth structure, using options such as tooth-coloured fillings, inlays/onlays, crowns and bridges as appropriate.',
    benefits: [
      'Tooth-coloured materials shade-matched to your natural teeth',
      'Conservative preparation preserving healthy tooth structure',
      'Restores chewing function and oral comfort',
      'Durable repair for chipped, cracked, or decayed teeth',
    ],
    procedure: [
      'Examination and X-ray',
      'Options and materials discussed',
      'Local anaesthesia if needed',
      'Preparing and restoring the tooth',
      'Bite check and polish',
      'Care instructions and review',
    ],
    whoIsItFor:
      'cavities, broken or chipped teeth, worn teeth, failing old fillings, teeth weakened after previous treatment.',
    faq: [
      {
        question: 'Filling or crown?',
        answer: 'It depends on how much healthy tooth remains.',
      },
      {
        question: 'Do restorations last forever?',
        answer: 'No, they need care and periodic checks.',
      },
      {
        question: 'Will the filling match my teeth?',
        answer: 'Tooth-coloured materials can be shade-matched.',
      },
    ],
  },
];

/** Look up a treatment by its URL slug or alias */
export function getTreatmentBySlug(slug: string): TreatmentPageData | undefined {
  const normalized = slug.toLowerCase().trim();
  return TREATMENTS.find((t) => t.slug === normalized || t.aliases?.includes(normalized));
}
