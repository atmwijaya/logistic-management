// FeaturedBarangSection.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Clock, Users, Shield, Calendar } from 'lucide-react';
import katalogAPI from '../../api/katalogAPI';
import { useNavigate } from 'react-router-dom';

const FeaturedBarangSection = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [featuredBarang, setFeaturedBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load data dari backend
  const loadFeaturedBarang = async () => {
    try {
      setLoading(true);
      const response = await katalogAPI.getAll();
      
      // Ambil barang populer (total dipinjam tinggi) tanpa filter status
      const popularBarang = (response || [])
        .sort((a, b) => (b.total_dipinjam || 0) - (a.total_dipinjam || 0))
        .slice(0, 6); // Ambil 6 barang paling populer

      setFeaturedBarang(popularBarang);
    } catch (err) {
      console.error('Error loading featured barang:', err);
      setFeaturedBarang([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedBarang();
  }, []);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(featuredBarang.length / itemsPerPage);
  const currentItems = featuredBarang.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  const getStatusColor = (status) => {
    return status === 'tersedia' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status) => {
    return status === 'tersedia' ? 'Tersedia' : 'Tidak Tersedia';
  };

  const getKualitasColor = (kualitas) => {
    switch (kualitas) {
      case 'Sangat Bagus': return 'text-green-600 bg-green-50';
      case 'Bagus': return 'text-blue-600 bg-blue-50';
      case 'Baik': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  // Helper function untuk mendapatkan gambar utama
  const getGambarUtama = (barang) => {
    if (!barang.gambar || !Array.isArray(barang.gambar)) return null;
    if (barang.gambar.length > 0 && typeof barang.gambar[0] === 'string') {
      return barang.gambar[0];
    }
    return null;
  };

  const handlePinjam = (barangId, e) => {
    e.stopPropagation();
    navigate(`/pinjam/${barangId}`);
  };

  const handleDetail = (barangId) => {
    navigate(`/katalog/${barangId}`);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-slate-600">Memuat barang populer...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-white to-blue-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Barang Populer
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Temukan barang-barang paling sering dipinjam dengan kualitas terjamin
          </p>
        </div>

        {/* Featured Items Grid */}
        <div className="relative">
          {/* Items Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentItems.map((barang) => {
              const gambarUtama = getGambarUtama(barang);
              const isTersedia = barang.status === 'tersedia';
              
              return (
                <div
                  key={barang.id}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group cursor-pointer ${
                    !isTersedia ? 'opacity-90' : ''
                  }`}
                  onClick={() => handleDetail(barang.id)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={gambarUtama || "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop&crop=center"}
                      alt={barang.nama}
                      className={`w-full h-48 object-cover transition-transform duration-300 ${
                        isTersedia ? 'group-hover:scale-105' : 'grayscale'
                      }`}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(barang.status)}`}>
                        {getStatusText(barang.status)}
                      </span>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-slate-700">{barang.rating || 4.5}</span>
                    </div>

                    {/* Overlay untuk barang tidak tersedia */}
                    {!isTersedia && (
                      <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                        <div className="bg-white bg-opacity-95 rounded-full px-4 py-2 shadow-lg">
                          <span className="text-sm font-semibold text-red-600 flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Sedang Dipinjam</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-3 line-clamp-1 transition-colors duration-300 ${
                      isTersedia ? 'text-slate-800 hover:text-blue-600' : 'text-slate-600'
                    }`}>
                      {barang.nama}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {barang.deskripsi}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{barang.total_dipinjam || 0}x dipinjam</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>Maks {barang.maks_peminjaman || '7 hari'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className={`px-2 py-1 rounded-full text-xs ${getKualitasColor(barang.kualitas)}`}>
                          {barang.kualitas || 'Baik'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className={`font-semibold ${isTersedia ? 'text-slate-800' : 'text-slate-500'}`}>
                          {formatRupiah(barang.harga || 0)}/hari
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => handlePinjam(barang.id, e)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        isTersedia
                          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                      disabled={!isTersedia}
                    >
                      {isTersedia ? 'Pinjam Sekarang' : 'Sedang Dipinjam'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls - hanya ditampilkan jika ada lebih dari 1 page */}
          {totalPages > 1 && (
            <>
              <div className="flex items-center justify-between">
                {/* Previous Button */}
                <button
                  onClick={prevPage}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:block">Sebelumnya</span>
                </button>

                {/* Pagination Dots */}
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToPage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentPage ? 'bg-blue-600 w-8' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={nextPage}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
                >
                  <span className="hidden sm:block">Selanjutnya</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Page Indicator */}
              <div className="text-center mt-4">
                <span className="text-sm text-slate-500">
                  Menampilkan {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, featuredBarang.length)} dari {featuredBarang.length} barang
                </span>
              </div>
            </>
          )}

          {/* Tampilkan pesan jika tidak ada barang */}
          {featuredBarang.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-slate-600">Tidak ada barang populer yang tersedia saat ini.</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/katalog')}
            className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Lihat Semua Barang
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBarangSection;