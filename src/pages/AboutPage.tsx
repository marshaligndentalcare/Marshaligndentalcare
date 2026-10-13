import React from 'react';
import { useSEO } from '../lib/seo';
import About from '../components/About';

const AboutPage: React.FC = () => {
  useSEO({
    title: 'About Marshalign Dental Care | Specialist Clinic in Trichy',
    description:
      'Learn about Marshalign Dental Care — a specialist dental clinic in KK Nagar, Trichy, led by Dr. Marshal Antony M. and Dr. Jose Olive A. Focused expertise and personal care.',
    canonical: '/about',
  });

  return <About />;
};

export default AboutPage;
