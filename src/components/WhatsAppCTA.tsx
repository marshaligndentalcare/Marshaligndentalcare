import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink, type WhatsAppEnquiryContext } from '../lib/whatsapp';
import styles from './WhatsAppCTA.module.css';

export interface WhatsAppCTAProps {
  label?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  context?: WhatsAppEnquiryContext;
  customMessage?: string;
}

const WhatsAppCTA: React.FC<WhatsAppCTAProps> = ({
  label = 'Enquire on WhatsApp',
  variant = 'primary',
  size = 'md',
  className = '',
  id,
  context,
  customMessage,
}) => {
  const handleClick = () => {
    const link = getWhatsAppLink(customMessage ? { type: 'custom', message: customMessage } : context);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`Open WhatsApp to enquire — ${label}`}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${className}`}
      id={id}
    >
      <MessageCircle size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

export default WhatsAppCTA;
