import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Clock, CheckCircle, Truck, PackageCheck } from 'lucide-react';

const FeaturedAlurSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef(null);
  const stepRefs = useRef([]);

  const alurPeminjaman = [
    {
      step: 1,
      icon: Search,
      title: "Cari Barang",
      description: "Telusuri katalog barang yang tersedia dan pilih sesuai kebutuhan Anda",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      lineColor: "bg-gradient-to-b from-blue-500 to-cyan-500"
    },
    {
      step: 2,
      icon: FileText,
      title: "Ajukan Peminjaman",
      description: "Isi form peminjaman dengan data lengkap dan jangka waktu peminjaman",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      lineColor: "bg-gradient-to-b from-purple-500 to-pink-500"
    },
    {
      step: 3,
      icon: Clock,
      title: "Tunggu Persetujuan",
      description: "Admin akan memverifikasi dan menyetujui permohonan peminjaman Anda",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      lineColor: "bg-gradient-to-b from-amber-500 to-orange-500"
    },
    {
      step: 4,
      icon: CheckCircle,
      title: "Konfirmasi & Bayar",
      description: "Konfirmasi peminjaman dan lakukan pembayaran sesuai ketentuan",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      lineColor: "bg-gradient-to-b from-green-500 to-emerald-500"
    },
    {
      step: 5,
      icon: Truck,
      title: "Ambil Barang",
      description: "Ambil barang yang dipinjam di lokasi yang telah ditentukan",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      lineColor: "bg-gradient-to-b from-indigo-500 to-blue-500"
    },
    {
      step: 6,
      icon: PackageCheck,
      title: "Kembalikan Barang",
      description: "Kembalikan barang dalam kondisi baik setelah masa peminjaman selesai",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      lineColor: "bg-gradient-to-b from-teal-500 to-cyan-500"
    }
  ];

  // Scroll handler dengan patokan tengah layar
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      
      // Posisi tengah layar
      const middleOfScreen = scrollPosition + (windowHeight / 2);
      
      // Hitung progress berdasarkan posisi tengah layar relatif terhadap section
      const sectionMiddle = sectionTop + (sectionHeight / 2);
      const distanceFromMiddle = middleOfScreen - sectionMiddle;
      
      // Normalize progress dari -1 sampai 1
      const normalizedProgress = distanceFromMiddle / (sectionHeight / 2);
      
      // Convert ke 0-1 range
      const progress = Math.min(Math.max((normalizedProgress + 1) / 2, 0), 1);
      
      const step = Math.min(
        Math.floor(progress * alurPeminjaman.length),
        alurPeminjaman.length - 1
      );
      
      setActiveStep(step);
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', throttledScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', throttledScroll);
    };
  }, [alurPeminjaman.length]);

  const getProgressHeight = () => {
    return `${((activeStep + 1) / alurPeminjaman.length) * 100}%`;
  };

  const getActiveLineColor = () => {
    return alurPeminjaman[activeStep]?.lineColor || 'bg-gradient-to-b from-blue-500 to-cyan-500';
  };

  return (
    <section ref={sectionRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-100/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Alur Peminjaman Mudah
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Proses peminjaman yang sederhana dan transparan dari awal hingga pengembalian
          </p>
        </div>

        {/* Desktop View - Timeline */}
        <div className="hidden lg:block">
          <div className="relative mb-12">
            {/* Animated Progress Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`w-full transition-all duration-300 ease-out ${getActiveLineColor()} rounded-full`}
                style={{ height: getProgressHeight() }}
              ></div>
            </div>
            
            {/* Steps */}
            <div className="space-y-20">
              {alurPeminjaman.map((step, index) => (
                <div
                  key={step.step}
                  className={`relative flex items-center transition-all duration-300 ${
                    index <= activeStep ? 'opacity-100 transform translate-y-0' : 'opacity-40 transform translate-y-4'
                  } ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Content */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <div className={`inline-block p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                      step.bgColor
                    } border border-white/50 backdrop-blur-sm ${
                      index <= activeStep ? 'scale-100' : 'scale-95'
                    } ${index === activeStep ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}>
                      <div className="flex items-center space-x-4">
                        {index % 2 === 0 && (
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${step.color} shadow-lg transition-transform duration-300 ${
                            index === activeStep ? 'scale-110' : 'scale-100'
                          }`}>
                            <step.icon className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-semibold text-slate-500">LANGKAH {step.step}</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {step.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        {index % 2 !== 0 && (
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${step.color} shadow-lg transition-transform duration-300 ${
                            index === activeStep ? 'scale-110' : 'scale-100'
                          }`}>
                            <step.icon className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Animated Step Number */}
                  <div className={`absolute left-1/2 transform -translate-x-1/2 w-12 h-12 border-4 rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-300 ${
                    index <= activeStep 
                      ? `bg-gradient-to-r ${step.color} border-white scale-110 shadow-xl` 
                      : 'bg-white border-slate-300 scale-100'
                  }`}>
                    <span className={`text-lg font-bold transition-colors duration-300 ${
                      index <= activeStep ? 'text-white' : 'text-slate-400'
                    }`}>
                      {step.step}
                    </span>
                  </div>

                  {/* Empty space for alignment */}
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile & Tablet View - Animated Grid */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Mobile Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`w-full transition-all duration-300 ease-out ${getActiveLineColor()} rounded-full`}
                style={{ height: getProgressHeight() }}
              ></div>
            </div>

            <div className="space-y-8 pl-16">
              {alurPeminjaman.map((step, index) => (
                <div
                  key={step.step}
                  className={`relative transition-all duration-300 ${
                    index <= activeStep ? 'opacity-100 transform translate-x-0' : 'opacity-40 transform -translate-x-4'
                  }`}
                >
                  {/* Mobile Step Number */}
                  <div className={`absolute -left-10 top-0 w-8 h-8 border-2 rounded-full flex items-center justify-center shadow-md z-10 transition-all duration-300 ${
                    index <= activeStep 
                      ? `bg-gradient-to-r ${step.color} border-white scale-110 shadow-lg` 
                      : 'bg-white border-slate-300 scale-100'
                  }`}>
                    <span className={`text-sm font-bold transition-colors duration-300 ${
                      index <= activeStep ? 'text-white' : 'text-slate-400'
                    }`}>
                      {step.step}
                    </span>
                  </div>

                  {/* Content Card */}
                  <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform border border-slate-100 p-6 ${
                    index <= activeStep ? 'scale-100' : 'scale-95'
                  } ${index === activeStep ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}`}>
                    {/* Step Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${step.color} shadow-lg transition-transform duration-300 ${
                        index === activeStep ? 'scale-110' : 'scale-100'
                      }`}>
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">LANGKAH {step.step}</span>
                        <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {step.description}
                    </p>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index <= activeStep ? `bg-gradient-to-r ${step.color}` : 'bg-slate-300'
                        }`}></div>
                        <span className="text-xs text-slate-500">
                          {index <= activeStep ? 'Selesai' : 'Menunggu'}
                        </span>
                      </div>
                      {index < 5 && (
                        <div className="text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAlurSection;