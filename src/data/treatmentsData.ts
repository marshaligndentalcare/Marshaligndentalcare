/**
 * Treatment data for individual treatment pages.
 * All 7 treatments are verified from the clinic's actual service offerings.
 * No unconfirmed treatments are listed.
 */

export interface TreatmentPageData {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  doctorName: string;
  icon: string;
  image: string;
  alt: string;
  shortDescription: string;
  pageTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  overview: string;
  benefits: string[];
  procedure: string[];
  whoIsItFor: string;
  faq: { question: string; answer: string }[];
}

export const TREATMENTS: TreatmentPageData[] = [
  {
    id: 'orthodontics',
    slug: 'orthodontics',
    name: 'Orthodontics & Braces',
    specialty: 'Orthodontics & Dentofacial Orthopedics',
    doctorName: 'Dr. Marshal Antony M.',
    icon: '⟳',
    image: '/orthodontics-treatment.webp',
    alt: 'Orthodontist examining and adjusting braces on patient in dental clinic',
    shortDescription:
      'Straighten misaligned teeth and achieve a balanced bite with evidence-based orthodontic treatment. Braces and modern orthodontic appliances tailored to your smile goals.',
    pageTitle: 'Orthodontics & Braces Treatment in Trichy | Marshalign Dental Care',
    metaDescription:
      'Expert orthodontic treatment and braces by Dr. Marshal Antony M., MDS Orthodontics, at Marshalign Dental Care, Trichy. Personalised treatment plans for all ages.',
    heroSubtitle: 'Specialist orthodontic care by Dr. Marshal Antony M., MDS',
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
    name: 'Dentofacial Orthopedics',
    specialty: 'Orthodontics & Dentofacial Orthopedics',
    doctorName: 'Dr. Marshal Antony M.',
    icon: '◈',
    image: '/dentofacial-orthopedics.webp',
    alt: 'Dentofacial orthopedics consultation and facial growth guidance',
    shortDescription:
      'Specialist guidance of facial growth and development in younger patients. Corrective appliances and interceptive treatment for lasting facial balance.',
    pageTitle: 'Dentofacial Orthopedics in Trichy | Marshalign Dental Care',
    metaDescription:
      'Dentofacial orthopedics for children and growing patients by Dr. Marshal Antony M. at Marshalign Dental Care, Trichy. Interceptive jaw growth guidance.',
    heroSubtitle: 'Guided jaw and facial growth management by Dr. Marshal Antony M., MDS',
    overview:
      'Dentofacial orthopedics focuses on guiding the growth and development of the facial bones and jaws, particularly in children and adolescents. At Marshalign Dental Care, Dr. Marshal Antony M. uses functional appliances and interceptive treatment strategies to correct jaw imbalances during the critical growth years, reducing the need for more invasive procedures later in life.',
    benefits: [
      'Addresses jaw growth discrepancies during the optimal developmental window',
      'Reduces the likelihood of needing surgical correction in adulthood',
      'Improves facial symmetry, breathing, and overall oral function',
      'Uses removable and fixed functional appliances tailored to the patient\'s growth stage',
      'Performed by a specialist with dedicated training in dentofacial orthopedics',
    ],
    procedure: [
      'Comprehensive evaluation including clinical examination and growth assessment imaging',
      'Diagnosis of skeletal growth patterns and identification of any jaw imbalances',
      'Custom selection and fitting of functional orthopedic appliances',
      'Periodic follow-up visits to monitor growth progress and adjust treatment',
      'Transition to orthodontic phase if needed once growth guidance is completed',
    ],
    whoIsItFor:
      'Dentofacial orthopedics is primarily for children and adolescents with jaw growth imbalances, such as a receding lower jaw, protruding upper jaw, or facial asymmetry. Early intervention during the growth period produces the most effective outcomes.',
    faq: [
      {
        question: 'At what age should a child see a dentofacial orthopedics specialist?',
        answer: 'The ideal time for evaluation is between ages 7 and 10, when the jaw is still growing and interceptive treatment can be most effective. However, the specialist can assess suitability at any age during active growth.',
      },
      {
        question: 'Is dentofacial orthopedics the same as orthodontics?',
        answer: 'They are related but distinct. Orthodontics focuses on aligning teeth, while dentofacial orthopedics specifically guides the growth and position of the jaw bones. Dr. Marshal Antony holds specialist training in both disciplines.',
      },
    ],
  },
  {
    id: 'implants',
    slug: 'dental-implants',
    name: 'Dental Implants',
    specialty: 'Prosthodontics & Implantology',
    doctorName: 'Dr. Jose Olive A.',
    icon: '⬡',
    image: '/dental-implant-treatment.webp',
    alt: 'Precision dental implant restoration planning in modern operatory',
    shortDescription:
      'Replace missing teeth permanently with precision-placed dental implants. A long-term solution that looks, feels, and functions like your natural teeth.',
    pageTitle: 'Dental Implants in Trichy | Marshalign Dental Care',
    metaDescription:
      'Dental implant treatment by Dr. Jose Olive A., MDS Prosthodontics & Implantology, at Marshalign Dental Care, Trichy. Permanent tooth replacement solutions.',
    heroSubtitle: 'Precision implantology by Dr. Jose Olive A., MDS',
    overview:
      'Dental implants are titanium posts surgically placed into the jawbone to serve as artificial tooth roots. Once integrated with the bone, they support permanent crowns, bridges, or dentures that look and function like natural teeth. At Marshalign Dental Care, implant treatment is planned and delivered by Dr. Jose Olive A., a specialist with an MDS in Prosthodontics & Implantology, ensuring precise surgical placement and high-quality prosthetic restoration.',
    benefits: [
      'Permanent replacement for one or more missing teeth',
      'Preserves jawbone density by stimulating the bone, preventing resorption',
      'Looks, feels, and functions like natural teeth — no removable dentures needed',
      'Does not require grinding down adjacent healthy teeth (unlike traditional bridges)',
      'Long-lasting solution with excellent success rates when properly maintained',
    ],
    procedure: [
      'Initial consultation with clinical examination, 3D imaging, and bone assessment',
      'Treatment planning to determine implant position, type, and prosthetic design',
      'Surgical placement of the titanium implant fixture into the jawbone',
      'Healing period (osseointegration) — typically 3 to 6 months for the implant to fuse with bone',
      'Placement of the final custom crown, bridge, or denture on the integrated implant',
    ],
    whoIsItFor:
      'Dental implants are suitable for adults who have lost one or more teeth due to injury, decay, or periodontal disease, and who have adequate jawbone density to support an implant. A clinical and radiographic assessment by Dr. Jose Olive will determine candidacy.',
    faq: [
      {
        question: 'How long do dental implants last?',
        answer: 'With proper oral hygiene and regular dental check-ups, dental implants can last many years and often a lifetime. The prosthetic crown on top may need replacement after 10–15 years depending on wear.',
      },
      {
        question: 'Is dental implant surgery painful?',
        answer: 'Implant placement is performed under local anaesthesia and is generally well-tolerated. Most patients report mild discomfort for a few days after surgery, manageable with prescribed medication.',
      },
    ],
  },
  {
    id: 'prosthodontics',
    slug: 'prosthodontics',
    name: 'Prosthodontics',
    specialty: 'Prosthodontics & Implantology',
    doctorName: 'Dr. Jose Olive A.',
    icon: '◇',
    image: '/prosthodontics-treatment.webp',
    alt: 'Prosthodontist assessing custom ceramic dental restoration and crown',
    shortDescription:
      'Restore the function and aesthetics of your smile with expertly crafted crowns, bridges, dentures, and full-mouth rehabilitation by a specialist prosthodontist.',
    pageTitle: 'Prosthodontics & Smile Restoration in Trichy | Marshalign Dental Care',
    metaDescription:
      'Prosthodontic treatment including crowns, bridges, dentures, and full-mouth rehabilitation by Dr. Jose Olive A. at Marshalign Dental Care, Trichy.',
    heroSubtitle: 'Specialist prosthetic rehabilitation by Dr. Jose Olive A., MDS',
    overview:
      'Prosthodontics is the dental specialty dedicated to restoring and replacing teeth through crowns, bridges, dentures, and comprehensive full-mouth rehabilitation. At Marshalign Dental Care, Dr. Jose Olive A. combines specialist MDS training in Prosthodontics & Implantology with modern restorative materials to provide durable, natural-looking results that restore both function and confidence.',
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
    name: 'General Dental Examination',
    specialty: 'Comprehensive Diagnostics',
    doctorName: 'Our dental specialists',
    icon: '◎',
    image: '/dental-examination.webp',
    alt: 'Dentist conducting comprehensive oral examination with mouth mirror',
    shortDescription:
      'Detailed clinical assessment of oral health, periodontal screening, and digital diagnostics to detect dental concerns early and maintain long-term smile wellness.',
    pageTitle: 'General Dental Examination in Trichy | Marshalign Dental Care',
    metaDescription:
      'Comprehensive dental check-up and examination at Marshalign Dental Care, Trichy. Thorough assessment, periodontal screening, and personalised care recommendations.',
    heroSubtitle: 'Thorough clinical assessment for complete peace of mind',
    overview:
      'A comprehensive general dental examination is the foundation of preventive oral healthcare. At Marshalign Dental Care, every examination includes a thorough clinical inspection of your teeth, gums, tongue, and oral tissues, along with diagnostic imaging where indicated. The goal is to identify any dental concerns early — before they require complex or costly treatment — and to develop a personalised care plan that supports your long-term oral health.',
    benefits: [
      'Early detection of tooth decay, gum disease, and other oral health conditions',
      'Comprehensive assessment including soft tissue and periodontal screening',
      'Diagnostic imaging to identify issues not visible to the naked eye',
      'Personalised oral health recommendations and preventive care guidance',
      'Establishes a baseline record for tracking your dental health over time',
    ],
    procedure: [
      'Discussion of your dental history, current concerns, and overall health',
      'Visual clinical examination of teeth, gums, tongue, and oral mucosa',
      'Diagnostic X-rays if clinically indicated',
      'Periodontal assessment to check gum health and attachment levels',
      'Summary of findings, personalised advice, and treatment recommendations if needed',
    ],
    whoIsItFor:
      'A general dental examination is recommended for everyone — adults, children, and elderly patients — at regular intervals. Even if you are not experiencing pain or obvious dental problems, routine examinations help prevent issues and maintain oral wellness.',
    faq: [
      {
        question: 'How often should I have a dental examination?',
        answer: 'Most dental professionals recommend a check-up every 6 to 12 months, depending on your individual oral health needs. Your dentist will advise on the right interval for you.',
      },
      {
        question: 'Do I need a dental examination if I have no pain?',
        answer: 'Yes. Many dental conditions, including early-stage decay and gum disease, can develop without causing noticeable pain. Regular examinations allow early detection and simpler treatment.',
      },
    ],
  },
  {
    id: 'cleaning',
    slug: 'teeth-cleaning',
    name: 'Professional Teeth Cleaning',
    specialty: 'Preventive Oral Care',
    doctorName: 'Our dental specialists',
    icon: '✦',
    image: '/teeth-cleaning.webp',
    alt: 'Dental professional performing ultrasonic scaling and teeth cleaning',
    shortDescription:
      'Gentle ultrasonic scaling and dental prophylaxis to remove plaque, tartar, and surface stains, protecting gums and refreshing oral freshness.',
    pageTitle: 'Professional Teeth Cleaning & Scaling in Trichy | Marshalign Dental Care',
    metaDescription:
      'Professional teeth cleaning and ultrasonic scaling at Marshalign Dental Care, Trichy. Remove plaque, tartar, and stains for healthier gums and fresher breath.',
    heroSubtitle: 'Preventive cleaning for lasting gum health and oral freshness',
    overview:
      'Professional teeth cleaning (dental prophylaxis) is a preventive procedure that removes plaque, calculus (tartar), and surface stains that cannot be adequately addressed by brushing and flossing alone. At Marshalign Dental Care, cleaning is performed using gentle ultrasonic scaling instruments followed by polishing, ensuring thorough removal of deposits above and below the gumline while maintaining patient comfort.',
    benefits: [
      'Removes hardened plaque (tartar) that regular brushing cannot eliminate',
      'Reduces the risk of gum disease (gingivitis and periodontitis)',
      'Eliminates surface stains for a cleaner, brighter appearance',
      'Freshens breath by removing bacteria-harbouring deposits',
      'Supports overall oral health and complements home hygiene routines',
    ],
    procedure: [
      'Clinical assessment of gum health and identification of calculus deposits',
      'Ultrasonic scaling to gently break down and remove tartar above and below the gumline',
      'Manual hand scaling for any remaining fine deposits',
      'Polishing to smooth tooth surfaces and remove superficial stains',
      'Oral hygiene guidance and recommended cleaning interval advice',
    ],
    whoIsItFor:
      'Professional teeth cleaning is recommended for all patients as part of routine preventive dental care. It is especially important for individuals with a tendency toward tartar build-up, early signs of gum inflammation, or those who have not had a professional cleaning in over 6 months.',
    faq: [
      {
        question: 'Does teeth cleaning hurt?',
        answer: 'Professional teeth cleaning is generally comfortable. You may feel mild vibration from the ultrasonic scaler and slight sensitivity in areas with heavy deposits, but the procedure is designed to be gentle.',
      },
      {
        question: 'How often should I get my teeth professionally cleaned?',
        answer: 'Most patients benefit from professional cleaning every 6 months. Patients with gum disease or heavy tartar build-up may need more frequent cleanings as recommended by their dentist.',
      },
    ],
  },
  {
    id: 'restorative',
    slug: 'restorative-dentistry',
    name: 'Restorative Dentistry',
    specialty: 'Conservative Dental Care',
    doctorName: 'Our dental specialists',
    icon: '❋',
    image: '/restorative-dentistry.webp',
    alt: 'Dentist placing and light-curing tooth-colored composite restoration',
    shortDescription:
      'Tooth-colored composite fillings and conservative restorations that blend seamlessly with natural enamel while restoring strength and chewing function.',
    pageTitle: 'Restorative Dentistry & Fillings in Trichy | Marshalign Dental Care',
    metaDescription:
      'Tooth-colored composite fillings and restorative dentistry at Marshalign Dental Care, Trichy. Conservative restorations that match your natural enamel.',
    heroSubtitle: 'Conservative restorations that preserve your natural tooth structure',
    overview:
      'Restorative dentistry at Marshalign Dental Care focuses on repairing teeth damaged by decay, fracture, or wear using modern tooth-colored composite materials. These restorations are designed to blend seamlessly with your natural enamel while restoring the tooth\'s structural integrity and chewing function. The approach is conservative — preserving as much healthy tooth structure as possible while ensuring a durable, aesthetic repair.',
    benefits: [
      'Tooth-colored composite materials that match your natural enamel shade',
      'Conservative approach that preserves maximum healthy tooth structure',
      'Restores chewing function and prevents further decay progression',
      'Durable repairs using modern bonding techniques and light-cured composites',
      'Aesthetically superior to traditional metal (amalgam) fillings',
    ],
    procedure: [
      'Clinical examination and assessment of the damaged tooth',
      'Local anaesthesia to ensure a comfortable procedure (if needed)',
      'Removal of decayed or damaged tooth structure',
      'Application and shaping of tooth-colored composite material in layers',
      'Light-curing to harden the restoration, followed by bite adjustment and polishing',
    ],
    whoIsItFor:
      'Restorative dentistry is appropriate for patients with tooth decay (cavities), chipped or fractured teeth, worn fillings that need replacement, or minor cosmetic imperfections. The treatment is suitable for both adults and children.',
    faq: [
      {
        question: 'How long do composite fillings last?',
        answer: 'Modern composite fillings typically last 5 to 10 years or more, depending on the size and location of the filling, your bite forces, and your oral hygiene. Regular check-ups help monitor filling integrity.',
      },
      {
        question: 'Are tooth-colored fillings as strong as metal fillings?',
        answer: 'Modern composite materials have improved significantly and are suitable for most restorations. For very large restorations under heavy biting forces, your dentist may recommend alternative materials and will discuss options with you.',
      },
    ],
  },
];

/** Look up a treatment by its URL slug */
export function getTreatmentBySlug(slug: string): TreatmentPageData | undefined {
  return TREATMENTS.find((t) => t.slug === slug);
}
