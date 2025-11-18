import React from 'react';
import HeroSection from '../../components/beranda/HeroSection';
import FeaturedBarangSection from '../../components/beranda/FeaturedBarangSection';
import FeaturedAlurSection from '../../components/beranda/FeaturedAlurSection';
import MapsSection from '../../components/beranda/MapsSection';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <HeroSection />
      <FeaturedBarangSection />
      <FeaturedAlurSection />
      <MapsSection />
    </div>
  );
};

export default HomePage;