import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import type { WhatsAppEnquiryContext } from '../lib/whatsapp';
import styles from './WhatsAppCTA.module.css';

export interface WhatsAppCTAProps {
  label?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  context?: WhatsAppEnquiryContext;
  /** Pre-select this treatment name in the modal (for treatment-specific CTAs) */
  treatmentName?: string;
  customMessage?: string;
}

const WhatsAppCTA: React.FC<WhatsAppCTAProps> = ({
  label = 'Enquire on WhatsApp',
  variant = 'primary',
  size = 'md',
  className = '',
  id,
  context,
  treatmentName,
}) => {
  const { openEnquiry } = useEnquiry();

  const handleClick = () => {
    // Derive a pre-selected treatment from explicit prop or context
    let preselected: string | undefined = treatmentName;

    if (!preselected && context) {
      if (context.type === 'service') preselected = context.serviceName;
      if (context.type === 'treatment') preselected = context.treatmentName;
    }

    openEnquiry({ treatmentName: preselected });
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`Open appointment enquiry form — ${label}`}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      id={id}
      type="button"
    >
      <MessageCircle size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

export default WhatsAppCTA;
