import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Clock, Users, Shield, Calendar } from 'lucide-react';

const FeaturedBarangSection = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const featuredBarang = [
    {
      id: 1,
      nama: "Tenda Dome 4 Person",
      gambar: "https://down-id.img.susercontent.com/file/10a6b9bfcddab0014d61d81a2b4c7297?w=400&h=300&fit=crop&crop=center",
      status: "tersedia",
      totalDipinjam: 42,
      maksPeminjaman: "7 hari",
      kualitas: "Bagus",
      deskripsi: "Tenda dome kapasitas 4 orang, waterproof, cocok untuk camping keluarga atau kelompok kecil.",
      harga: "Rp 25.000/hari",
      rating: 4.8
    },
    {
      id: 2,
      nama: "Kompor Portable Gas",
      gambar: "https://cdn.ruparupa.io/fit-in/400x400/filters:format(webp)/filters:quality(90)/ruparupa-com/image/upload/Products/10485182_1.jpg?w=400&h=300&fit=crop&crop=center",
      status: "tidak_tersedia",
      totalDipinjam: 38,
      maksPeminjaman: "14 hari",
      kualitas: "Sangat Bagus",
      deskripsi: "Kompor portable dengan sistem gas cartridge, praktis dan mudah dibawa untuk aktivitas outdoor.",
      harga: "Rp 15.000/hari",
      rating: 4.9
    },
    {
      id: 3,
      nama: "Sleeping Bag -5°C",
      gambar: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop&crop=center",
      status: "tersedia",
      totalDipinjam: 35,
      maksPeminjaman: "10 hari",
      kualitas: "Bagus",
      deskripsi: "Sleeping bag tahan hingga suhu -5°C, bahan waterproof, nyaman untuk camping di daerah dingin.",
      harga: "Rp 12.000/hari",
      rating: 4.7
    },
    {
      id: 4,
      nama: "Carrier 60L Expedition",
      gambar: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop&crop=center",
      status: "tersedia",
      totalDipinjam: 28,
      maksPeminjaman: "14 hari",
      kualitas: "Sangat Bagus",
      deskripsi: "Carrier kapasitas 60 liter dengan frame internal, cocok untuk pendakian dan expedition panjang.",
      harga: "Rp 20.000/hari",
      rating: 4.9
    },
    {
      id: 5,
      nama: "Nesting Cooking Set",
      gambar: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center",
      status: "tidak_tersedia",
      totalDipinjam: 31,
      maksPeminjaman: "21 hari",
      kualitas: "Bagus",
      deskripsi: "Set peralatan masak nesting yang praktis, terdiri dari panci, wajan, dan cangkir yang saling menyatu.",
      harga: "Rp 10.000/hari",
      rating: 4.6
    },
    {
      id: 6,
      nama: "Headlamp LED Waterproof",
      gambar: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center",
      status: "tersedia",
      totalDipinjam: 45,
      maksPeminjaman: "30 hari",
      kualitas: "Baik",
      deskripsi: "Headlamp LED dengan daya tahan baterai panjang, waterproof IPX4, cocok untuk aktivitas malam.",
      harga: "Rp 8.000/hari",
      rating: 4.5
    }
  ];

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
            {currentItems.map((barang) => (
              <div
                key={barang.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={barang.gambar}
                    alt={barang.nama}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <span className="text-sm font-semibold text-slate-700">{barang.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-1">
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
                      <span>{barang.totalDipinjam}x dipinjam</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Maks {barang.maksPeminjaman}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className={`px-2 py-1 rounded-full text-xs ${getKualitasColor(barang.kualitas)}`}>
                        {barang.kualitas}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-slate-800">{barang.harga}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      barang.status === 'tersedia'
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                    disabled={barang.status !== 'tersedia'}
                  >
                    {barang.status === 'tersedia' ? 'Pinjam Sekarang' : 'Sedang Dipinjam'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
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
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <button className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            Lihat Semua Barang
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBarangSection;