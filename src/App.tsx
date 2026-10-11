import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Treatments from './components/Treatments';
import Specialists from './components/Specialists';
import WhyUs from './components/WhyUs';
import Gallery from './components/Gallery';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppCTA from './components/WhatsAppCTA';

const App: React.FC = () => {
  return (
    <>
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <About />
        <Treatments />
        <Specialists />
        <WhyUs />
        <Gallery />
        <FAQ />
        <Contact />
      </main>

      <Footer />

      {/* Floating WhatsApp FAB */}
      <WhatsAppCTA
        label="WhatsApp"
        variant="floating"
        size="md"
      />
    </>
  );
};

export default App;
