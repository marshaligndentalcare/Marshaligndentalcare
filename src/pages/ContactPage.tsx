import React from 'react';
import { useSEO } from '../lib/seo';
import Contact from '../components/Contact';

const ContactPage: React.FC = () => {
  useSEO({
    title: 'Contact Us | Marshalign Dental Care, Trichy',
    description:
      'Get in touch with Marshalign Dental Care at 345, Rajaram Road, KK Nagar, Trichy. Call +91 90256 55627 or WhatsApp us. Open Mon–Sat 9 AM–2 PM & 5 PM–8:30 PM.',
    canonical: '/contact',
  });

  return <Contact />;
};

export default ContactPage;
