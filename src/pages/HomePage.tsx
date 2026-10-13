import React from 'react';
import { useSEO } from '../lib/seo';
import Hero from '../components/Hero';
import About from '../components/About';
import Treatments from '../components/Treatments';
import Specialists from '../components/Specialists';
import WhyUs from '../components/WhyUs';
import Gallery from '../components/Gallery';
import FAQ from '../components/FAQ';
import TestimonialsMarquee from '../components/TestimonialsMarquee';
import Contact from '../components/Contact';

const HomePage: React.FC = () => {
  useSEO({
    title: 'Marshalign Dental Care | Specialist Dental Clinic, Trichy',
    description:
      'Marshalign Dental Care – specialist dental clinic in Trichy, Tamil Nadu. Expert Orthodontics, Prosthodontics & Dental Implants by Dr. Marshal Antony and Dr. Jose Olive.',
    canonical: '/',
  });

  return (
    <>
      <Hero />
      <About />
      <Treatments />
      <Specialists />
      <WhyUs />
      <Gallery />
      <FAQ />
      <TestimonialsMarquee />
      <Contact />
    </>
  );
};

export default HomePage;
