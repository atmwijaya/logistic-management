import React, { useState, useEffect } from 'react';
import { Package, Play, ArrowRight, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import phoneAPI from '../../api/contactAPI';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handlePinjam = () => {
    navigate('/katalog');
  };

  const handleWhatsAppClick = async () => {
    try {
      // Ganti dengan API call yang sesuai untuk mendapatkan nomor WhatsApp
      const response = await phoneAPI.getPhone();
      const phoneNumber = response.data || "";

      const preFilledMessage =
        "Halo, saya ingin bertanya tentang layanan logistik Racana Diponegoro.";

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        preFilledMessage
      )}`;

      window.open(whatsappUrl, "_blank");
    } catch (error) {
      alert("Gagal mengambil nomor WhatsApp. Coba lagi nanti.");
      console.error("WA Error:", error);
    }
  };

  // Tambah aja sesuai kebutuhan
  const bottomImages = [
    {
      src: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=250&fit=crop&crop=center",
      alt: "Tracking System",
      shadow: "shadow-indigo-500/10 hover:shadow-indigo-500/20"
    },
    {
      src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop&crop=center",
      alt: "Warehouse Management",
      shadow: "shadow-purple-500/10 hover:shadow-purple-500/20"
    },
    {
      src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop&crop=center",
      alt: "Inventory System",
      shadow: "shadow-blue-500/10 hover:shadow-blue-500/20"
    },
    {
      src: "https://cdn.polytron.co.id/public-assets/polytroncoid/2024/04/PAS-PRO15F2-FM-gambar-2.jpg?w=400&h=250&fit=crop&crop=center",
      alt: "Logistics Management",
      shadow: "shadow-green-500/10 hover:shadow-green-500/20"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bottomImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bottomImages.length) % bottomImages.length);
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative overflow-hidden min-h-screen md:min-h-[85vh] flex items-center">
        
      {/* Background Animated Elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-linear-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-32 right-12 w-32 h-32 bg-linear-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-8 w-24 h-24 bg-linear-to-r from-cyan-200/30 to-blue-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2.5s' }} />
      <div className="absolute bottom-1/4 left-16 w-20 h-20 bg-linear-to-r from-indigo-200/25 to-blue-200/25 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-linear-to-r from-blue-300/15 to-purple-300/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Mobile View */}
      <div className="md:hidden relative z-10 w-full px-4 py-8 text-center">
        <div className="mb-4">
          <h2 className="text-2xl font-medium text-slate-800 mb-2">
            Selamat datang di
          </h2>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-blue-300 to-blue-200 transform -skew-y-1 rounded-lg opacity-80"></div>
            <h1 className="relative text-2xl font-bold text-slate-800 px-4 py-2">
              Logistik Manager
            </h1>
          </div>
          <p className="text-slate-600 text-base mb-4 mt-4">Sistem Peminjaman Logistik Racana Diponegoro</p>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
            Kelola peminjaman logistik dengan mudah dan efisien. Lacak status barang dan kelola inventaris.
          </p>
        </div>

        <div className="mb-8 max-w-xs mx-auto">
          <div className="space-y-3">
            {/* Top Image - Mobile Grid */}
            <div className="relative group">
              <div className="bg-white/15 backdrop-blur-2xl border border-white/25 rounded-2xl overflow-hidden shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105">
                <div className="w-full h-40 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Inventory Management"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Images Slider - Mobile */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {bottomImages.map((image, index) => (
                    <div key={index} className="w-full flex-shrink-0">
                      <div className="relative group mx-1">
                        <div className={`bg-white/15 backdrop-blur-2xl border border-white/25 rounded-2xl overflow-hidden ${image.shadow} transition-all duration-500 hover:scale-105`}>
                          <div className="w-full h-20 overflow-hidden">
                            <img 
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Dots - Mobile */}
              <div className="flex justify-center space-x-2 mt-3">
                {bottomImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-blue-600 w-4' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 max-w-xs mx-auto">
          <button onClick={handlePinjam} className="bg-linear-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 text-sm">
            <Package className="w-4 h-4" />
            <span>Pinjam Barang</span>
          </button>
          <button onClick={handleWhatsAppClick} className="bg-white/25 backdrop-blur-xl border border-white/40 text-slate-700 px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 text-sm">
            <ClipboardList className="w-4 h-4" />
            <span>Hubungi kami</span>
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-10">
              <h2 className="text-5xl lg:text-6xl font-medium text-slate-800 mb-4">
                Selamat datang di
              </h2>
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-linear-to-r from-blue-400 via-blue-300 to-blue-200 transform -skew-y-1 rounded-xl opacity-80"></div>
                <h1 className="relative text-5xl lg:text-6xl font-semibold text-slate-800 px-6 py-3 whitespace-nowrap">
                  Logistik Manager
                </h1>
              </div>
              <p className="text-2xl text-slate-600 mb-8">Sistem Peminjaman Logistik Racana Diponegoro</p>
              <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
                Kelola peminjaman logistik dengan mudah dan efisien. Lacak status barang dan kelola inventaris.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <button onClick={handlePinjam} className="bg-linear-to-r from-blue-600 to-blue-500 text-white px-10 py-5 rounded-2xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 text-lg">
                <Package className="w-6 h-6" />
                <span>Pinjam Barang</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={handleWhatsAppClick} className="bg-white/25 backdrop-blur-xl border border-white/40 text-slate-700 px-10 py-5 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 text-lg">
                <ClipboardList className="w-6 h-6" />
                <span>Hubungi kami</span>
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative max-w-2xl mx-auto lg:max-w-2xl">
            <div className="space-y-6">
              {/* Top Image */}
              <div className="relative group">
                <div className="bg-white/15 backdrop-blur-2xl border border-white/25 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105">
                  <div className="w-full h-80 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Inventory Management"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Images Slider */}
              <div className="relative">
                <div className="overflow-hidden rounded-3xl">
                  <div 
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentSlide * 50}%)` }}
                  >
                    {bottomImages.map((image, index) => (
                      <div key={index} className="w-1/2 flex-shrink-0 px-3">
                        <div className="relative group">
                          <div className={`bg-white/15 backdrop-blur-2xl border border-white/25 rounded-3xl overflow-hidden ${image.shadow} transition-all duration-500 hover:scale-105`}>
                            <div className="w-full h-40 overflow-hidden">
                              <img 
                                src={image.src}
                                alt={image.alt}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>

                {/* Navigation Dots */}
                <div className="flex justify-center space-x-2 mt-4">
                  {bottomImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide ? 'bg-blue-600 w-6' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;