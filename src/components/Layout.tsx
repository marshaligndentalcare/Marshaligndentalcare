import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppCTA from './WhatsAppCTA';

/**
 * Shared layout wrapper — renders Navbar, Footer, and floating WhatsApp FAB
 * around whichever page <Outlet /> is currently routed.
 *
 * FAB visibility logic:
 * - Hidden when the hero CTA (#hero-whatsapp-btn) is on screen (to avoid duplication)
 * - Hidden when the footer (#footer) is on screen (to avoid covering footer content)
 */
const Layout: React.FC = () => {
  const location = useLocation();
  const [heroBtnInView, setHeroBtnInView] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  // Observe the hero WhatsApp button
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let timer: number | null = null;

    const attach = () => {
      const el = document.getElementById('hero-whatsapp-btn');
      if (el) {
        observer = new IntersectionObserver(
          ([entry]) => {
            setHeroBtnInView(entry.isIntersecting);
          },
          { threshold: 0.05 }
        );
        observer.observe(el);
      } else {
        setHeroBtnInView(false);
      }
    };

    attach();
    timer = window.setTimeout(attach, 250);

    return () => {
      if (timer) clearTimeout(timer);
      observer?.disconnect();
    };
  }, [location.pathname]);

  // Observe the footer — hide FAB when footer is visible
  useEffect(() => {
    const footerEl = document.getElementById('footer');
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(footerEl);
    return () => observer.disconnect();
  }, [location.pathname]);

  const fabHidden = heroBtnInView || footerInView;

  return (
    <>
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Outlet />
      </main>

      <Footer />

      {/* Floating WhatsApp FAB — visible on every page, hidden when hero CTA or footer is in view */}
      <div
        style={{
          opacity: fabHidden ? 0 : 1,
          pointerEvents: fabHidden ? 'none' : 'auto',
          transition: 'opacity 0.25s ease, visibility 0.25s ease',
          visibility: fabHidden ? 'hidden' : 'visible',
        }}
      >
        <WhatsAppCTA
          label="WhatsApp"
          variant="floating"
          size="md"
          context={{ type: 'general' }}
        />
      </div>
    </>
  );
};

export default Layout;
