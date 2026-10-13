import React from 'react';
import { useSEO } from '../lib/seo';
import TestimonialsMarquee from '../components/TestimonialsMarquee';

const ReviewsPage: React.FC = () => {
  useSEO({
    title: 'Patient Reviews | Marshalign Dental Care, Trichy',
    description:
      'Read verified Google reviews from patients of Marshalign Dental Care, Trichy. 5.0-star rated specialist dental clinic.',
    canonical: '/reviews',
  });

  return <TestimonialsMarquee />;
};

export default ReviewsPage;
