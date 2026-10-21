/**
 * context/EnquiryContext.tsx
 * Provides a single `openEnquiry` function available anywhere in the app.
 * The actual modal is rendered once at the top of the tree (in App.tsx).
 */
import React, { createContext, useCallback, useContext, useState } from 'react';

export interface EnquiryOptions {
  /** Pre-select a treatment by its name (from TREATMENTS[].name) */
  treatmentName?: string;
}

interface EnquiryContextValue {
  isOpen: boolean;
  options: EnquiryOptions;
  openEnquiry: (opts?: EnquiryOptions) => void;
  closeEnquiry: () => void;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export const EnquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen]   = useState(false);
  const [options, setOptions] = useState<EnquiryOptions>({});

  const openEnquiry = useCallback((opts: EnquiryOptions = {}) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeEnquiry = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <EnquiryContext.Provider value={{ isOpen, options, openEnquiry, closeEnquiry }}>
      {children}
    </EnquiryContext.Provider>
  );
};

/** Hook — throws if used outside <EnquiryProvider> */
export function useEnquiry(): EnquiryContextValue {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error('useEnquiry must be used inside <EnquiryProvider>');
  return ctx;
}
