import React, { useState, useRef, useEffect } from 'react';
import styles from './FAQ.module.css';
import { FaPlus, FaMinus } from 'react-icons/fa';

const faqs = [
  {
    id: 'faq-1',
    question: 'How can I enquire about treatments?',
    answer:
      'The easiest way is to send a WhatsApp message to our clinic. Simply click any "Enquire on WhatsApp" button on this page and a pre-filled message will open for you to review and send. You can also call us directly at +91 90256 55627.',
  },
  {
    id: 'faq-2',
    question: 'Which treatments are available at Marshalign?',
    answer:
      'Marshalign Dental Care offers Orthodontics & Braces, Dentofacial Orthopedics, Prosthodontics, Dental Implants, professional teeth cleaning, and restorative dentistry. Please enquire via WhatsApp or phone for the most up-to-date list of services.',
  },
  {
    id: 'faq-3',
    question: 'Who are the doctors at Marshalign?',
    answer:
      'Marshalign is led by Dr. Marshal Antony M. (Specialist in Orthodontics & Dentofacial Orthopedics) and Dr. Jose Olive A. (Specialist in Prosthodontics & Implantology).',
  },
  {
    id: 'faq-4',
    question: 'Can I book an appointment online?',
    answer:
      'We currently handle all enquiries and appointment requests through WhatsApp and phone. Click any WhatsApp button on this website to send us a message and our team will get back to you promptly.',
  },
  {
    id: 'faq-5',
    question: 'Where is Marshalign Dental Care located?',
    answer:
      'We are located at 345, Rajaram Road, near KK Nagar Bus Terminal, Trichy – 21, Tamil Nadu, India. Use the Google Maps link in our contact section for directions.',
  },
  {
    id: 'faq-6',
    question: 'How do I contact the clinic?',
    answer:
      'You can reach us via WhatsApp or phone at +91 90256 55627. You can also visit us at 345, Rajaram Road, near KK Nagar Bus Terminal, Trichy – 21, Tamil Nadu.',
  },
];

interface FAQItemProps {
  item: typeof faqs[0];
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ item, index, isOpen, onToggle }) => {
  return (
    <div
      className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
      id={item.id}
    >
      <button
        type="button"
        className={styles.trigger}
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        aria-controls={`${item.id}-answer`}
        id={`${item.id}-button`}
      >
        <span className={styles.question}>{item.question}</span>
        <span className={styles.iconWrap} aria-hidden="true">
          <span className={`${styles.iconInner} ${isOpen ? styles.iconInnerRotated : ''}`}>
            {isOpen ? <FaMinus /> : <FaPlus />}
          </span>
        </span>
      </button>

      <div
        id={`${item.id}-answer`}
        role="region"
        aria-labelledby={`${item.id}-button`}
        className={styles.answer}
        aria-hidden={!isOpen}
      >
        <div className={styles.answerInner}>
          <p className={styles.answerText}>{item.answer}</p>
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.inView);
        }
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleToggle = (index: number) => {
    setActiveFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="faq-heading"
    >
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header} data-animate>
          <span className={styles.badge}>Frequently asked questions</span>
          <h2 id="faq-heading" className={styles.heading}>
            Got questions about Marshalign?<br className={styles.headingBreak} />
            We&rsquo;ve got answers.
          </h2>
        </div>

        {/* Accordion */}
        <div className={styles.accordion} data-animate>
          {faqs.map((item, index) => (
            <FAQItem
              key={item.id}
              item={item}
              index={index}
              isOpen={activeFaqIndex === index}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
