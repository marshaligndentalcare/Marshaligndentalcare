import { WA_NUMBER } from '../config';

export type WhatsAppEnquiryContext =
  | { type: 'service'; serviceName: string }
  | { type: 'doctor'; doctorName: string }
  | { type: 'treatment'; treatmentName: string }
  | { type: 'section'; sectionName: string }
  | { type: 'general' }
  | { type: 'custom'; message: string };

/**
 * Builds a natural, context-specific WhatsApp message based on the source context.
 * Conforms to clinic communication guidelines:
 * - Service enquiries: "Hi, I would like to enquire about the [Service Name] service."
 * - Doctor enquiries: "Hi, I would like to enquire about an appointment with [Doctor Name]."
 * - Section / General enquiries: specific to section or general appointment enquiry.
 */
export function buildWhatsAppMessage(context?: WhatsAppEnquiryContext | string): string {
  if (!context) {
    return 'Hi, I would like to enquire about dental treatments and appointments at Marshalign Dental Care.';
  }

  if (typeof context === 'string') {
    return context;
  }

  switch (context.type) {
    case 'service':
    case 'treatment': {
      const rawName = context.type === 'service' ? context.serviceName : context.treatmentName;
      const trimmed = rawName.trim();
      const endsWithService = /service$/i.test(trimmed);
      const formatted = endsWithService ? trimmed : `${trimmed} service`;
      return `Hi, I would like to enquire about the ${formatted}.`;
    }

    case 'doctor': {
      return `Hi, I would like to enquire about an appointment with ${context.doctorName.trim()}.`;
    }

    case 'section': {
      switch (context.sectionName.toLowerCase()) {
        case 'hero':
          return 'Hi, I found your website and would like to enquire about booking a dental consultation at Marshalign Dental Care.';
        case 'contact':
          return 'Hi, I would like to get in touch with Marshalign Dental Care to schedule a visit.';
        case 'navbar':
        case 'navigation':
        case 'mobile navigation':
          return 'Hi, I found Marshalign Dental Care online and would like to enquire about your dental services.';
        case 'footer':
          return 'Hi, I would like to enquire about treatments and appointments at Marshalign Dental Care.';
        default:
          return `Hi, I would like to enquire about ${context.sectionName} at Marshalign Dental Care.`;
      }
    }

    case 'custom': {
      return context.message;
    }

    case 'general':
    default: {
      return 'Hi, I would like to enquire about dental treatments and appointments at Marshalign Dental Care.';
    }
  }
}

/**
 * Generates the full WhatsApp URL with proper URL encoding.
 */
export function getWhatsAppLink(context?: WhatsAppEnquiryContext | string): string {
  const message = buildWhatsAppMessage(context);
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}
