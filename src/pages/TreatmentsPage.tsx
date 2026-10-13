import React from 'react';
import { useSEO } from '../lib/seo';
import Treatments from '../components/Treatments';

const TreatmentsPage: React.FC = () => {
  useSEO({
    title: 'Dental Treatments in Trichy | Marshalign Dental Care',
    description:
      'Explore specialist dental treatments at Marshalign Dental Care, Trichy — Orthodontics, Dental Implants, Prosthodontics, Dentofacial Orthopedics, teeth cleaning, and restorative dentistry.',
    canonical: '/treatments',
  });

  return <Treatments />;
};

export default TreatmentsPage;
