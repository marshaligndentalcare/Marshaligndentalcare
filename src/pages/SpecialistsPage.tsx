import React from 'react';
import { useSEO } from '../lib/seo';
import Specialists from '../components/Specialists';

const SpecialistsPage: React.FC = () => {
  useSEO({
    title: 'Our Specialists & Consultants | Marshalign Dental Care, Trichy',
    description:
      'Meet the dental specialists and consultants at Marshalign Dental Care, Trichy — Dr. Marshal Antony M. (Orthodontics & Dentofacial Orthopedics), Dr. Jose Olive A. (Prosthodontics & Implantology), Dr. Meenakshi (Endodontics), and Dr. J. Sowmiya (Consultant, MDS).',
    canonical: '/specialists',
  });

  return <Specialists />;
};

export default SpecialistsPage;
