import React from 'react';
import { useSEO } from '../lib/seo';
import FAQ from '../components/FAQ';

const FAQPage: React.FC = () => {
  useSEO({
    title: 'Frequently Asked Questions | Marshalign Dental Care, Trichy',
    description:
      'Answers to common questions about dental treatments, appointments, and services at Marshalign Dental Care, Trichy.',
    canonical: '/faq',
  });

  return <FAQ />;
};

export default FAQPage;
