import React from 'react';
import { useSEO } from '../lib/seo';
import Specialists from '../components/Specialists';

const DoctorsPage: React.FC = () => {
  useSEO({
    title: 'Our Doctors | Marshalign Dental Care, Trichy',
    description:
      'Meet the specialist dentists at Marshalign Dental Care, Trichy — Dr. Marshal Antony M. (Orthodontics & Dentofacial Orthopedics) and Dr. Jose Olive A. (Prosthodontics & Implantology).',
    canonical: '/doctors',
  });

  return <Specialists />;
};

export default DoctorsPage;
