import React from 'react';
import { MessageCircle } from 'lucide-react';
import { WA_LINK } from '../config';
import styles from './WhatsAppCTA.module.css';

interface WhatsAppCTAProps {
  label?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const WhatsAppCTA: React.FC<WhatsAppCTAProps> = ({
  label = 'Enquire on WhatsApp',
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const handleClick = () => {
    window.open(WA_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`Open WhatsApp to enquire at Marshalign Dental Care — ${label}`}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      id="whatsapp-cta"
    >
      <MessageCircle size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

export default WhatsAppCTA;
