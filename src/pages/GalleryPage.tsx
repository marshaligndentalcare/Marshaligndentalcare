import React from 'react';
import { useSEO } from '../lib/seo';
import Gallery from '../components/Gallery';

const GalleryPage: React.FC = () => {
  useSEO({
    title: 'Clinic Gallery | Marshalign Dental Care, Trichy',
    description:
      'View photos of Marshalign Dental Care clinic, treatment suites, and modern dental infrastructure in KK Nagar, Trichy.',
    canonical: '/gallery',
  });

  return <Gallery />;
};

export default GalleryPage;
