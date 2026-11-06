import React from 'react';
import { useSEO } from '../lib/seo';
import Specialists from '../components/Specialists';

const SpecialistsPage: React.FC = () => {
  useSEO({
    title: 'Our Doctors | Marshalign Dental Care, Trichy',
    description:
      'Meet the doctors at Marshalign Dental Care, Trichy — Dr. Marshal Antony M. (Orthodontics & Dentofacial Orthopedics), Dr. Jose Olive A. (Prosthodontics & Implantology), Dr. J. Sowmiya (MDS), and Dr. Meenakshi (Specialist Endodontist).',
    canonical: '/specialists',
  });

  return <Specialists mode="page" />;
};

export default SpecialistsPage;
