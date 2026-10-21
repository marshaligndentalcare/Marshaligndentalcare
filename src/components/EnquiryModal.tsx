/**
 * EnquiryModal.tsx
 * Appointment-request form modal.
 * - Desktop: centred dialog
 * - Mobile (≤600px): bottom sheet
 * - Validates inline, opens WhatsApp directly in the click handler
 * - No persistence (no localStorage, cookies, analytics, or server calls)
 */
import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { X, MessageCircle, AlertCircle } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { TREATMENTS } from '../data/treatmentsData';
import { CLINIC_HOURS, WA_NUMBER } from '../config';
import {
  buildEnquiryURL,
  validateEnquiryForm,
  todayISO,
  type EnquiryFormValues,
  type EnquiryFormErrors,
} from '../lib/enquiry';
import styles from './EnquiryModal.module.css';

// "General enquiry / not sure" sentinel value
const GENERAL_TREATMENT = 'General enquiry / not sure';

// ── Focusable element selector for focus trap ─────────────────────────────────
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// ── Component ─────────────────────────────────────────────────────────────────
const EnquiryModal: React.FC = () => {
  const { isOpen, options, closeEnquiry } = useEnquiry();

  const formId     = useId();
  const dialogRef  = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Save trigger element when modal opens so we can restore focus on close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // ── Form state ──────────────────────────────────────────────────────────────
  const initialValues: EnquiryFormValues = {
    name: '',
    phone: '',
    location: '',
    treatment: options.treatmentName ?? '',
    date: '',
    time: '',
    note: '',
  };

  const [values, setValues]       = useState<EnquiryFormValues>(initialValues);
  const [errors, setErrors]       = useState<EnquiryFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [waURL, setWaURL]         = useState<string | null>(null);

  // Reset form whenever modal opens (with pre-selected treatment if provided)
  useEffect(() => {
    if (isOpen) {
      setValues({
        name: '',
        phone: '',
        location: '',
        treatment: options.treatmentName ?? '',
        date: '',
        time: '',
        note: '',
      });
      setErrors({});
      setSubmitted(false);
      setWaURL(null);
    }
  }, [isOpen, options.treatmentName]);

  // ── Focus management & focus trap ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus first input after animation frame
    const raf = requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEnquiry();
        return;
      }

      if (e.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to trigger
      triggerRef.current?.focus();
    };
  }, [isOpen, closeEnquiry]);

  // ── Body scroll lock ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // ── Field change handler ────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear individual error on change
      if (errors[name as keyof EnquiryFormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const errs = validateEnquiryForm(values);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        // Focus first error field
        requestAnimationFrame(() => {
          const firstErrField = dialogRef.current?.querySelector<HTMLElement>(
            '[aria-invalid="true"]'
          );
          firstErrField?.focus();
        });
        return;
      }

      const url = buildEnquiryURL(values);
      setWaURL(url);
      setSubmitted(true);

      // Open WhatsApp directly inside the click handler — avoids popup blockers
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [values]
  );

  // ── Skip / direct WhatsApp link ─────────────────────────────────────────────
  const skipURL = `https://wa.me/${WA_NUMBER}`;

  // ── Treatment options list ──────────────────────────────────────────────────
  const treatmentOptions = [
    GENERAL_TREATMENT,
    ...TREATMENTS.map((t) => t.name),
  ];

  // ── Don't render if closed ─────────────────────────────────────────────────
  if (!isOpen) return null;

  // ── IDs for aria-describedby ─────────────────────────────────────────────
  const id = (field: string) => `${formId}-${field}`;
  const errId = (field: string) => `${formId}-${field}-err`;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeEnquiry();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id('title')}
        aria-describedby={id('subtitle')}
        className={styles.dialog}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 id={id('title')} className={styles.title}>
              Request an Appointment
            </h2>
            <p id={id('subtitle')} className={styles.subtitle}>
              Send a request to Marshalign Dental Care — we'll confirm your
              slot on WhatsApp.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeEnquiry}
            aria-label="Close appointment request form"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className={styles.body}>
          <form
            id={id('form')}
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Name + Phone */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor={id('name')} className={styles.label}>
                  Full name<span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id={id('name')}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Priya Lakshmi"
                  value={values.name}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? errId('name') : undefined}
                />
                {errors.name && (
                  <span id={errId('name')} role="alert" className={styles.errorMsg}>
                    <AlertCircle size={12} aria-hidden="true" />
                    {errors.name}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor={id('phone')} className={styles.label}>
                  Mobile number<span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id={id('phone')}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="e.g. 90256 55627"
                  value={values.phone}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? errId('phone') : undefined}
                />
                {errors.phone && (
                  <span id={errId('phone')} role="alert" className={styles.errorMsg}>
                    <AlertCircle size={12} aria-hidden="true" />
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Location */}
            <div className={styles.field}>
              <label htmlFor={id('location')} className={styles.label}>
                Your area / locality<span className={styles.required} aria-hidden="true">*</span>
              </label>
              <input
                id={id('location')}
                name="location"
                type="text"
                autoComplete="address-level2"
                placeholder="e.g. Srirangam, Trichy"
                value={values.location}
                onChange={handleChange}
                className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                aria-required="true"
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? errId('location') : undefined}
              />
              {errors.location && (
                <span id={errId('location')} role="alert" className={styles.errorMsg}>
                  <AlertCircle size={12} aria-hidden="true" />
                  {errors.location}
                </span>
              )}
            </div>

            {/* Treatment */}
            <div className={styles.field}>
              <label htmlFor={id('treatment')} className={styles.label}>
                Treatment<span className={styles.required} aria-hidden="true">*</span>
              </label>
              <select
                id={id('treatment')}
                name="treatment"
                value={values.treatment}
                onChange={handleChange}
                className={`${styles.select} ${errors.treatment ? styles.selectError : ''}`}
                aria-required="true"
                aria-invalid={!!errors.treatment}
                aria-describedby={errors.treatment ? errId('treatment') : undefined}
              >
                <option value="" disabled>Select a treatment…</option>
                {treatmentOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {errors.treatment && (
                <span id={errId('treatment')} role="alert" className={styles.errorMsg}>
                  <AlertCircle size={12} aria-hidden="true" />
                  {errors.treatment}
                </span>
              )}
            </div>

            {/* Date + Time */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor={id('date')} className={styles.label}>
                  Preferred date<span className={styles.required} aria-hidden="true">*</span>
                </label>
                <input
                  id={id('date')}
                  name="date"
                  type="date"
                  min={todayISO()}
                  value={values.date}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                  aria-required="true"
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? errId('date') : undefined}
                />
                {errors.date && (
                  <span id={errId('date')} role="alert" className={styles.errorMsg}>
                    <AlertCircle size={12} aria-hidden="true" />
                    {errors.date}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor={id('time')} className={styles.label}>
                  Preferred time<span className={styles.required} aria-hidden="true">*</span>
                </label>
                <select
                  id={id('time')}
                  name="time"
                  value={values.time}
                  onChange={handleChange}
                  className={`${styles.select} ${errors.time ? styles.selectError : ''}`}
                  aria-required="true"
                  aria-invalid={!!errors.time}
                  aria-describedby={errors.time ? errId('time') : undefined}
                >
                  <option value="" disabled>Select a time…</option>
                  {CLINIC_HOURS.map(({ label, value }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.time && (
                  <span id={errId('time')} role="alert" className={styles.errorMsg}>
                    <AlertCircle size={12} aria-hidden="true" />
                    {errors.time}
                  </span>
                )}
              </div>
            </div>

            {/* Note (optional) */}
            <div className={styles.field}>
              <label htmlFor={id('note')} className={styles.label}>
                Additional note{' '}
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>
                  (optional)
                </span>
              </label>
              <textarea
                id={id('note')}
                name="note"
                rows={3}
                maxLength={210}
                placeholder="Any specific concerns, questions, or context for the team…"
                value={values.note}
                onChange={handleChange}
                className={`${styles.textarea} ${errors.note ? styles.textareaError : ''}`}
                aria-invalid={!!errors.note}
                aria-describedby={
                  [errId('note'), id('note-count')].join(' ')
                }
              />
              <span
                id={id('note-count')}
                className={`${styles.charCount} ${values.note.length > 200 ? styles.charCountOver : ''}`}
                aria-live="polite"
                aria-atomic="true"
              >
                {values.note.length} / 200
              </span>
              {errors.note && (
                <span id={errId('note')} role="alert" className={styles.errorMsg}>
                  <AlertCircle size={12} aria-hidden="true" />
                  {errors.note}
                </span>
              )}
            </div>

            {/* Privacy notice */}
            <p className={styles.privacy}>
              🔒 Your details are only used to prepare this WhatsApp message.
              We don't store them on this website.
            </p>
          </form>
        </div>

        {/* Footer / actions */}
        <div className={styles.footer}>
          <button
            type="submit"
            form={id('form')}
            className={styles.submitBtn}
          >
            <MessageCircle size={20} aria-hidden="true" />
            Continue on WhatsApp
          </button>

          <p className={styles.disclaimer}>
            This sends an appointment <strong>request</strong>. The clinic will
            confirm your slot on WhatsApp.
          </p>

          {/* Fallback link after submit */}
          {submitted && waURL && (
            <a
              href={waURL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fallbackLink}
            >
              If WhatsApp did not open, tap here →
            </a>
          )}

          {/* Skip link and separator */}
          <div className={styles.skipRow}>
            <button
              type="button"
              className={styles.skipLink}
              onClick={() => {
                window.open(skipURL, '_blank', 'noopener,noreferrer');
              }}
            >
              Skip — just open WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryModal;
