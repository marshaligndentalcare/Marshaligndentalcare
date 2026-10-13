import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppCTA from './WhatsAppCTA';

/**
 * Shared layout wrapper — renders Navbar, Footer, and floating WhatsApp FAB
 * around whichever page <Outlet /> is currently routed.
 */
const Layout: React.FC = () => {
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

      {/* Floating WhatsApp FAB — visible on every page */}
      <WhatsAppCTA
        label="WhatsApp"
        variant="floating"
        size="md"
        context={{ type: 'general' }}
      />
    </>
  );
};

export default Layout;
