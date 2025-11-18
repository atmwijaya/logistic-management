import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/navbar/userNavbar';
import Footer from '../components/footer/userFooter';
import HomePage from '../pages/user/HomePage';


// Komponen untuk halaman 404
const NotFound = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          Maaf, halaman yang Anda cari tidak ditemukan. Silakan kembali ke beranda.
        </p>
        <a 
          href="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-300 inline-block"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
};

const UserLayout = () => {
  return (
    <div className="App">
      {/* Navigation untuk User */}
      <div className="hidden md:block">
      <Navbar />
      </div>
      <div className="block md:hidden">
        
      </div>

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Fallback route untuk 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserLayout;