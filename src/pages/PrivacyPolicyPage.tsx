import React from 'react';
import { useSEO } from '../lib/seo';
import { CLINIC_NAME, CLINIC_ADDRESS, CLINIC_PHONE } from '../config';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './PrivacyPolicyPage.module.css';

const PrivacyPolicyPage: React.FC = () => {
  useSEO({
    title: 'Privacy Policy & Medical Disclaimer | Marshalign Dental Care',
    description:
      'Privacy policy and medical disclaimer for Marshalign Dental Care, Trichy. How we handle patient information and the scope of website content.',
    canonical: '/privacy-policy',
  });

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.breadcrumbWrap}>
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        </div>
        <h1 className={styles.heading}>Privacy Policy & Medical Disclaimer</h1>

          <div className={styles.content}>
            <h2>1. Introduction & Patient Privacy</h2>
            <p>
              {CLINIC_NAME} ("we", "our", or "us") is committed to protecting the privacy
              and confidentiality of our patients and website visitors. This policy outlines
              how information is handled when you interact with our website or submit
              treatment enquiries.
            </p>

            <h2>2. Information We Receive</h2>
            <p>
              Our website does not collect hidden personal tracking data or sell your
              information. When you initiate an enquiry via WhatsApp or phone call, you
              voluntarily provide contact information (such as your phone number and name)
              to request appointment availability or treatment consultations.
            </p>

            <h2>3. Healthcare Confidentiality</h2>
            <p>
              Any diagnostic or medical information shared during consultations is treated
              with strict healthcare confidentiality in accordance with professional dental
              practice ethics and relevant Indian medical data protection standards.
            </p>

            <h2>4. Medical & Clinical Disclaimer</h2>
            <p>
              The content provided on this website is for informational, educational, and
              appointment coordination purposes only. It is not intended to substitute for
              individualized diagnostic evaluation, clinical advice, or treatment by a
              licensed dental surgeon. Any clinical recommendations require an in-person
              dental examination and diagnostic imaging.
            </p>

            <h2>5. Third-Party Services</h2>
            <p>
              Our website provides direct links to WhatsApp (Meta Platforms) and Google Maps
              (Alphabet Inc.) to assist with directions and messaging. Interactions with
              these third-party services are governed by their respective privacy policies.
            </p>

            <h2>6. Contacting the Clinic</h2>
            <p>
              If you have questions regarding our privacy practices or wish to update your
              records, please visit us at {CLINIC_ADDRESS} or call {CLINIC_PHONE}.
            </p>
          </div>
        </div>
      </section>
  );
};

export default PrivacyPolicyPage;
