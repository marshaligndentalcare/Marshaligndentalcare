import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { CLINIC_NAME, CLINIC_ADDRESS, CLINIC_PHONE } from '../config';
import styles from './PrivacyPolicyModal.module.css';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 id="privacy-modal-title" className={styles.title}>
            Privacy Policy &amp; Medical Disclaimer
          </h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Privacy Policy dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.content}>
          <h4>1. Introduction &amp; Patient Privacy</h4>
          <p>
            {CLINIC_NAME} (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting the privacy and confidentiality of our patients and website visitors. This policy outlines how information is handled when you interact with our website or submit treatment enquiries.
          </p>

          <h4>2. Information We Receive</h4>
          <p>
            Our website does not collect hidden personal tracking data or sell your information. When you initiate an enquiry via WhatsApp or phone call, you voluntarily provide contact information (such as your phone number and name) to request appointment availability or treatment consultations.
          </p>

          <h4>3. Healthcare Confidentiality</h4>
          <p>
            Any diagnostic or medical information shared during consultations is treated with strict healthcare confidentiality in accordance with professional dental practice ethics and relevant Indian medical data protection standards.
          </p>

          <h4>4. Medical &amp; Clinical Disclaimer</h4>
          <p>
            The content provided on this website is for informational, educational, and appointment coordination purposes only. It is not intended to substitute for individualized diagnostic evaluation, clinical advice, or treatment by a licensed dental surgeon. Any clinical recommendations require an in-person dental examination and diagnostic imaging.
          </p>

          <h4>5. Third-Party Services</h4>
          <p>
            Our website provides direct links to WhatsApp (Meta Platforms) and Google Maps (Alphabet Inc.) to assist with directions and messaging. Interactions with these third-party services are governed by their respective privacy policies.
          </p>

          <h4>6. Contacting the Clinic</h4>
          <p>
            If you have questions regarding our privacy practices or wish to update your records, please visit us at {CLINIC_ADDRESS} or call {CLINIC_PHONE}.
          </p>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.primaryBtn} onClick={onClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
