import React, { useState, useRef, useEffect } from 'react';
import styles from './FAQ.module.css';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How can I enquire about treatments?',
    a: 'The easiest way is to send a WhatsApp message to our clinic. Simply click any "Enquire on WhatsApp" button on this page and a pre-filled message will open for you to review and send. You can also call us directly at +91 90256 55627.',
  },
  {
    q: 'Which treatments are available at Marshalign?',
    a: 'Marshalign Dental Care currently offers Orthodontics & Braces, Dentofacial Orthopedics, Prosthodontics, and Dental Implants. Please enquire via WhatsApp or phone for the most up-to-date list of services.',
  },
  {
    q: 'How do I contact the clinic?',
    a: 'You can reach us via WhatsApp or phone at +91 90256 55627. You can also visit us directly at 345, Rajaram Road, near KK Nagar Bus Terminal, Trichy – 21, Tamil Nadu.',
  },
  {
    q: 'Where is Marshalign Dental Care located?',
    a: 'We are located at 345, Rajaram Road, near KK Nagar Bus Terminal, Trichy – 21, Tamil Nadu, India. Use the Google Maps link in our contact section for directions.',
  },
  {
    q: 'Can I book an appointment online?',
    a: 'We currently handle all enquiries and appointment requests through WhatsApp and phone. Click any WhatsApp button on this website to send us a message and our team will get back to you.',
  },
  {
    q: 'Who are the doctors at Marshalign?',
    a: 'Marshalign is led by Dr. Marshal Antony M. (Specialist in Orthodontics & Dentofacial Orthopedics) and Dr. Jose Olive A. (Specialist in Prosthodontics & Implantology).',
  },
];

const FAQItem: React.FC<{ q: string; a: string; index: number }> = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.item} ${open ? styles.itemOpen : ''}`} id={`faq-${index}`}>
      <button
        className={styles.question}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
      >
        <span>{q}</span>
        <ChevronDown size={20} className={styles.chevron} aria-hidden="true" />
      </button>
      <div
        id={`faq-answer-${index}`}
        className={styles.answer}
        role="region"
        aria-hidden={!open}
      >
        <p className={styles.answerText}>{a}</p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add(styles.inView); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="faq" className={styles.section} ref={sectionRef} aria-labelledby="faq-heading">
      <div className={styles.container}>
        <div className={styles.header} data-animate>
          <div className={styles.tag}>
            <span className={styles.tagDot} aria-hidden="true" /> FAQ
          </div>
          <h2 id="faq-heading" className={styles.heading}>
            Common questions<br />
            <span className={styles.headingAccent}>answered.</span>
          </h2>
        </div>

        <div className={styles.list} data-animate>
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} index={i} />)}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
